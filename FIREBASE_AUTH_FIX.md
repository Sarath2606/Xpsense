# Firebase Authentication Fix for Splitwise Integration

## 🚨 Issue Description

The Splitwise integration was experiencing 401 Unauthorized errors because:

1. **Mismatched Authentication Systems**: The frontend was sending Firebase ID tokens, but the backend was expecting JWT tokens
2. **Wrong Middleware**: Splitwise routes were using JWT authentication middleware instead of Firebase authentication middleware
3. **Interface Mismatch**: Controllers were using the wrong request interface

## ✅ Solutions Implemented

### 1. Updated Authentication Middleware

**Updated all Splitwise routes to use Firebase authentication:**

- `backend/src/routes/splitwise-groups.routes.ts`
- `backend/src/routes/splitwise-expenses.routes.ts`
- `backend/src/routes/splitwise-balances.routes.ts`
- `backend/src/routes/splitwise-settlements.routes.ts`

**Changed from:**
```typescript
import { authenticateToken } from '../middleware/auth.middleware';
router.use(authenticateToken);
```

**Changed to:**
```typescript
import { authenticateFirebaseToken } from '../middleware/firebase-auth.middleware';
router.use(authenticateFirebaseToken);
```

### 2. Updated Controller Interfaces

**Updated all Splitwise controllers to use FirebaseAuthRequest:**

- `backend/src/controllers/splitwise-groups.controller.ts`
- `backend/src/controllers/splitwise-expenses.controller.ts`
- `backend/src/controllers/splitwise-balances.controller.ts`
- `backend/src/controllers/splitwise-settlements.controller.ts`

**Changed from:**
```typescript
import { AuthRequest } from '../middleware/auth.middleware';
static async createGroup(req: AuthRequest, res: Response)
```

**Changed to:**
```typescript
import { FirebaseAuthRequest } from '../middleware/firebase-auth.middleware';
static async createGroup(req: FirebaseAuthRequest, res: Response)
```

### 3. Development Tools

**Created `backend/restart-with-firebase-auth.js`:**
- Automatically restarts the backend server with new authentication
- Provides clear feedback about the changes made

## 🚀 Quick Fix Instructions

### Option 1: Automatic Fix (Recommended)

1. **Stop your backend server** (Ctrl+C)
2. **Run the fix script:**
   ```bash
   cd backend
   npm run dev:firebase-auth
   ```

### Option 2: Manual Fix

1. **Stop your backend server** (Ctrl+C)
2. **Restart your backend server:**
   ```bash
   cd backend
   npm run dev
   ```

3. **Refresh your frontend** and try accessing the Splitwise page again

## 🔧 Technical Details

### Authentication Flow

**Before (Broken):**
1. Frontend sends Firebase ID token
2. Backend tries to verify as JWT token
3. Verification fails with 401 Unauthorized

**After (Fixed):**
1. Frontend sends Firebase ID token
2. Backend verifies as Firebase ID token
3. Authentication succeeds

### Development Mode

The Firebase authentication middleware includes a development mode that:
- Creates a mock user even without a token
- Uses a hardcoded user ID for development
- Allows testing without proper Firebase setup

### Production Mode

In production, the middleware will:
- Properly verify Firebase ID tokens
- Extract user information from the token
- Map Firebase UID to internal user ID

## 🧪 Testing

After applying the fix:

1. **Clear your browser cache** or open in incognito mode
2. **Navigate to the Splitwise page** in your stats section
3. **Check the browser console** for any remaining errors
4. **Verify that groups load** without authentication errors

## 📝 Troubleshooting

### Still Getting 401 Unauthorized?

1. **Check your backend logs** for authentication messages
2. **Verify the backend server restarted** with the new changes
3. **Check if you're logged in** to the frontend
4. **Clear browser cache** and try again

### Backend Not Starting?

1. **Check for TypeScript compilation errors**
2. **Verify all imports are correct**
3. **Check the console** for specific error messages

### Development Mode Issues?

1. **Check your .env file** has `NODE_ENV=development`
2. **Verify the mock user ID** exists in your database
3. **Check backend logs** for development authentication messages

## 🎯 Expected Behavior

After the fix:

- ✅ **No more 401 Unauthorized errors** in the console
- ✅ **Groups load successfully** on the Splitwise page
- ✅ **Authentication works** with Firebase tokens
- ✅ **Development mode** works without proper Firebase setup
- ✅ **Production mode** ready for proper Firebase integration

## 📚 Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Express Middleware Best Practices](https://expressjs.com/en/guide/using-middleware.html)
- [TypeScript Interface Documentation](https://www.typescriptlang.org/docs/handbook/interfaces.html)
