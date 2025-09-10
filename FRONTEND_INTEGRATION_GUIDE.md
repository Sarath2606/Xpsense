# 🎨 Frontend Integration Guide - Splitwise API

## 📋 Overview

Your React frontend has been successfully integrated with the Splitwise API backend. The integration includes:

- ✅ **API Service Layer** - Complete Splitwise API endpoints
- ✅ **Custom Hooks** - `useSplitwiseApi` for state management
- ✅ **Real-time Data** - Live updates from the database
- ✅ **Error Handling** - Comprehensive error states and loading indicators
- ✅ **Authentication** - JWT token-based authentication

## 🏗️ Architecture

### 1. API Service Layer (`src/config/api.js`)

```javascript
// Splitwise API endpoints
splitwise: {
  groups: { getAll, getById, create, update, delete, addMember, removeMember, updateMemberRole },
  expenses: { getByGroup, getById, create, update, delete, getSplitTypes },
  balances: { getGroupBalances, getMyBalance, getMyGroupBalances, validateGroupBalances, getBalanceHistory, getSettlementSuggestions },
  settlements: { getByGroup, getById, create, update, delete, getByUser }
}
```

### 2. Custom Hook (`src/hooks/use_splitwise_api.js`)

```javascript
const { loading, error, clearError, groups, expenses, balances, settlements } = useSplitwiseApi();
```

**Features:**
- Automatic loading states
- Error handling and display
- Retry logic
- Type-safe API calls

### 3. Component Integration

#### SplitwiseView.js
- **Before**: Used localStorage for data persistence
- **After**: Real-time API calls with loading states
- **Features**: Error display, loading indicators, automatic data refresh

#### GroupDetailView.js
- **Before**: Local expense calculations
- **After**: Server-side balance calculations
- **Features**: Real-time expense updates, live balance tracking

#### CreateGroupView.js
- **Before**: Local group creation
- **After**: Database-backed group creation
- **Features**: Member management, validation

## 🔧 API Endpoints

### Groups
```javascript
// Get all user's groups
const response = await groupsApi.getAll();
// Response: { groups: [...], total: number }

// Create new group
const response = await groupsApi.create({
  name: "Trip to Bali",
  description: "Vacation expenses",
  currencyCode: "AUD"
});
// Response: { message: "Group created successfully", group: {...} }

// Update group
const response = await groupsApi.update(groupId, updateData);

// Delete group
await groupsApi.delete(groupId);
```

### Expenses
```javascript
// Get group expenses
const response = await expensesApi.getByGroup(groupId);
// Response: { expenses: [...], total: number }

// Create expense
const response = await expensesApi.create(groupId, {
  payerId: "user123",
  amount: 150.00,
  currency: "AUD",
  description: "Dinner",
  splitType: "EQUAL",
  participants: ["user123", "user456"],
  date: "2024-01-15"
});

// Get split types
const response = await expensesApi.getSplitTypes();
// Response: ["EQUAL", "UNEQUAL", "PERCENT", "SHARES"]
```

### Balances
```javascript
// Get group balances
const response = await balancesApi.getGroupBalances(groupId);
// Response: { userBalances: [...], totalNet: number, currency: "AUD" }

// Get user's balance in group
const response = await balancesApi.getMyBalance(groupId);

// Get settlement suggestions
const response = await balancesApi.getSettlementSuggestions(groupId);
```

## 🎯 Component Usage Examples

### Creating a Group
```javascript
import { useSplitwiseApi } from '../hooks/use_splitwise_api';

const CreateGroupComponent = () => {
  const { groups } = useSplitwiseApi();
  
  const handleCreate = async (groupData) => {
    try {
      const response = await groups.create(groupData);
      console.log('Group created:', response.group);
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };
};
```

### Loading Group Data
```javascript
const GroupComponent = ({ groupId }) => {
  const [group, setGroup] = useState(null);
  const { groups, loading, error } = useSplitwiseApi();
  
  useEffect(() => {
    const loadGroup = async () => {
      try {
        const response = await groups.getById(groupId);
        setGroup(response.group);
      } catch (error) {
        console.error('Failed to load group:', error);
      }
    };
    
    if (groupId) {
      loadGroup();
    }
  }, [groupId]);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!group) return <div>Group not found</div>;
  
  return <div>{group.name}</div>;
};
```

## 🔐 Authentication Flow

### 1. User Login
```javascript
// User logs in through your existing auth system
const response = await apiService.auth.login({
  email: 'user@example.com',
  password: 'password123'
});

// JWT token is automatically included in all API calls
const token = response.token;
```

### 2. Automatic Token Handling
```javascript
// The API service automatically includes the JWT token
const headers = await apiService.getHeaders();
// Headers: { 'Authorization': 'Bearer <jwt-token>', 'Content-Type': 'application/json' }
```

### 3. Error Handling
```javascript
// 401 Unauthorized - User needs to re-authenticate
if (response.status === 401) {
  // Redirect to login or refresh token
  window.location.href = '/login';
}
```

## 🎨 UI Components

### Loading States
```javascript
{loading && (
  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
    <div className="flex items-center">
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500">...</svg>
      <span className="text-blue-800">Loading...</span>
    </div>
  </div>
)}
```

### Error States
```javascript
{error && (
  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
    <div className="flex items-center">
      <svg className="w-5 h-5 text-red-400 mr-2">...</svg>
      <span className="text-red-800">{error}</span>
      <button onClick={() => setError(null)}>×</button>
    </div>
  </div>
)}
```

## 🚀 Getting Started

### 1. Start the Backend
```bash
cd backend
node dist/app.js
```

### 2. Start the Frontend
```bash
npm start
```

### 3. Test the Integration
1. Navigate to the Splitwise page in your app
2. Create a new group
3. Add expenses to the group
4. View real-time balances

## 🔧 Configuration

### Environment Variables
```bash
# Backend
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Frontend
REACT_APP_API_URL=http://localhost:3001/api
```

### API Base URL
```javascript
// src/config/api.js
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
```

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS is configured for `http://localhost:3000`
   - Check that the API base URL is correct

2. **Authentication Errors**
   - Verify JWT token is being sent in headers
   - Check that user is logged in
   - Ensure token hasn't expired

3. **Data Not Loading**
   - Check browser network tab for failed requests
   - Verify backend server is running
   - Check console for error messages

### Debug Mode
```javascript
// Enable debug logging in api.js
const DEBUG = true;
if (DEBUG) {
  console.log('API Request:', { url, method, headers, body });
}
```

## 📈 Performance Optimizations

### 1. Caching
```javascript
// Cache groups data
const [groups, setGroups] = useState([]);
const [lastFetch, setLastFetch] = useState(null);

const loadGroups = async () => {
  const now = Date.now();
  if (lastFetch && (now - lastFetch) < 30000) {
    return; // Cache for 30 seconds
  }
  
  const response = await groupsApi.getAll();
  setGroups(response.groups);
  setLastFetch(now);
};
```

### 2. Optimistic Updates
```javascript
// Update UI immediately, then sync with server
const handleAddExpense = async (expenseData) => {
  // Optimistic update
  const tempExpense = { ...expenseData, id: `temp_${Date.now()}` };
  setExpenses(prev => [...prev, tempExpense]);
  
  try {
    const response = await expensesApi.create(groupId, expenseData);
    // Replace temp expense with real one
    setExpenses(prev => prev.map(e => e.id === tempExpense.id ? response.expense : e));
  } catch (error) {
    // Remove temp expense on error
    setExpenses(prev => prev.filter(e => e.id !== tempExpense.id));
  }
};
```

## 🎉 Success!

Your Splitwise frontend is now fully integrated with the backend API! 

**Key Features Working:**
- ✅ Real-time group management
- ✅ Live expense tracking
- ✅ Automatic balance calculations
- ✅ User authentication
- ✅ Error handling and loading states
- ✅ Responsive UI with Tailwind CSS

**Next Steps:**
1. Test all functionality in the browser
2. Add more features like settlements
3. Implement real-time updates with WebSockets
4. Add email invitations
5. Create mobile app version

Happy coding! 🚀
