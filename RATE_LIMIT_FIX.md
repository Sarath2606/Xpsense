# Rate Limiting Fix for Splitwise Integration

## 🚨 Issue Description

The Splitwise integration was experiencing rate limiting errors (429 Too Many Requests) due to:

1. **Aggressive rate limiting**: 100 requests per 15 minutes was too restrictive for development
2. **Component re-rendering**: The SplitwiseView component was making multiple API calls due to useEffect dependencies
3. **Retry logic**: The frontend was retrying failed requests too aggressively

## ✅ Solutions Implemented

### 1. Backend Rate Limiting Improvements

**Updated `backend/src/app.ts`:**
- Increased development rate limit from 100 to 5000 requests per minute
- Reduced window from 15 minutes to 1 minute
- Added better error handling and logging
- Added custom rate limit handler with retry-after information

**Updated `backend/env.example`:**
```env
# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=5000
```

### 2. Frontend Optimizations

**Updated `src/components/splitwise/SplitwiseView.js`:**
- Added refs to prevent duplicate API calls
- Optimized useEffect dependencies to prevent unnecessary re-renders
- Added manual retry functionality for rate limiting errors
- Improved error handling and user feedback

**Updated `src/config/api.js`:**
- Reduced retry attempts from 3 to 2
- Increased base delay from 1s to 2s
- Better exponential backoff strategy

### 3. Development Tools

**Created `backend/restart-with-new-rate-limits.js`:**
- Automatically updates .env file with new rate limiting settings
- Restarts the backend server with new configuration
- Provides clear feedback and instructions

## 🚀 Quick Fix Instructions

### Option 1: Automatic Fix (Recommended)

1. **Stop your backend server** (Ctrl+C)
2. **Run the fix script:**
   ```bash
   cd backend
   npm run dev:rate-limit-fix
   ```

### Option 2: Manual Fix

1. **Update your backend `.env` file:**
   ```env
   RATE_LIMIT_WINDOW_MS=60000
   RATE_LIMIT_MAX_REQUESTS=5000
   ```

2. **Restart your backend server:**
   ```bash
   cd backend
   npm run dev
   ```

3. **Refresh your frontend** and try accessing the Splitwise page again

## 🔧 Technical Details

### Rate Limiting Configuration

**Development Environment:**
- **Window**: 1 minute (60,000ms)
- **Max Requests**: 5,000 per minute
- **Successful requests**: Not counted
- **Failed requests**: Still counted

**Production Environment:**
- **Window**: 1 minute (60,000ms)
- **Max Requests**: 100 per minute
- **Successful requests**: Not counted
- **Failed requests**: Still counted

### Frontend Optimizations

1. **Prevent Duplicate Calls:**
   ```javascript
   const groupsLoadedRef = useRef(false);
   const loadingRef = useRef(false);
   ```

2. **Optimized useEffect:**
   ```javascript
   useEffect(() => {
     if (!authHookAuthenticated || groupsLoadedRef.current) return;
     // ... load groups
   }, [authHookAuthenticated]); // Removed loadGroups dependency
   ```

3. **Manual Retry:**
   ```javascript
   const handleRetry = useCallback(() => {
     setAuthError(null);
     groupsLoadedRef.current = false;
     loadingRef.current = false;
     loadGroups();
   }, [loadGroups]);
   ```

## 🧪 Testing

After applying the fix:

1. **Clear your browser cache** or open in incognito mode
2. **Navigate to the Splitwise page** in your stats section
3. **Check the browser console** for any remaining errors
4. **Verify that groups load** without rate limiting errors

## 📝 Troubleshooting

### Still Getting Rate Limited?

1. **Check your backend logs** for rate limit messages
2. **Verify your .env file** has the correct settings
3. **Restart both frontend and backend** servers
4. **Clear browser cache** and try again

### Component Still Re-rendering?

1. **Check the browser console** for "Groups already loaded" messages
2. **Verify authentication state** is stable
3. **Check for other components** that might be causing re-renders

### Backend Not Starting?

1. **Check your .env file** syntax
2. **Verify all dependencies** are installed
3. **Check the console** for specific error messages

## 🎯 Expected Behavior

After the fix:

- ✅ **No more rate limiting errors** in the console
- ✅ **Groups load on first visit** to Splitwise page
- ✅ **Manual retry button** works if needed
- ✅ **Better error messages** for users
- ✅ **Optimized performance** with fewer API calls

## 📚 Additional Resources

- [Express Rate Limit Documentation](https://github.com/nfriedly/express-rate-limit)
- [React useEffect Best Practices](https://react.dev/reference/react/useEffect)
- [Frontend Error Handling Guide](./FRONTEND_INTEGRATION_GUIDE.md)
