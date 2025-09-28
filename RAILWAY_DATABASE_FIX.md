# Railway Database Connection Fix Guide

## Problem
Your application is getting 401 Unauthorized errors because the backend can't connect to the PostgreSQL database, which causes Firebase authentication to fail.

## Root Cause
The error `Can't reach database server at postgres.railway.internal:5432` indicates that either:
1. The PostgreSQL database service isn't running
2. The database service isn't properly linked to your backend service
3. The `DATABASE_URL` environment variable is incorrect

## Step-by-Step Fix

### Step 1: Check Railway Dashboard
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Open your project
3. Verify you have **two services**:
   - Your backend service (Node.js)
   - A PostgreSQL database service

### Step 2: Add PostgreSQL Database (if missing)
If you don't have a PostgreSQL service:
1. Click "New Service" in your Railway project
2. Select "Database" → "PostgreSQL"
3. Wait for it to deploy

### Step 3: Link Database to Backend
1. Go to your backend service settings
2. Go to "Variables" tab
3. Look for `DATABASE_URL` - it should be automatically set by Railway
4. If not present, add it manually:
   - Click "New Variable"
   - Name: `DATABASE_URL`
   - Value: Copy from your PostgreSQL service's "Connect" tab

### Step 4: Verify Environment Variables
Your backend service should have these variables:
```
DATABASE_URL=postgresql://postgres:password@postgres.railway.internal:5432/railway
NODE_ENV=production
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="your-private-key"
# ... other Firebase variables
```

### Step 5: Redeploy Backend
1. Go to your backend service
2. Click "Deploy" or trigger a new deployment
3. Watch the logs for database connection success

### Step 6: Test Database Connection
Run this command locally to test your database:
```bash
cd backend
npm run db:health
```

## Expected Logs After Fix
You should see:
```
✅ Database connection successful
✅ Database query successful - Found X users
✅ Database write operation successful
✅ Database delete operation successful
🎉 Database is healthy and fully functional!
```

## If Still Having Issues

### Check Railway Logs
1. Go to your backend service
2. Click "Deployments" tab
3. Click on the latest deployment
4. Check the logs for database connection errors

### Common Issues and Solutions

**Issue**: `DATABASE_URL` not set
**Solution**: Add the variable from your PostgreSQL service's Connect tab

**Issue**: Database service not running
**Solution**: Restart the PostgreSQL service in Railway

**Issue**: Wrong database URL format
**Solution**: Ensure it follows: `postgresql://user:password@host:port/database`

**Issue**: Authentication failed
**Solution**: Check that the database credentials in Railway are correct

## Testing Your Fix
After fixing the database connection:
1. Your frontend should stop getting 401 errors
2. Firebase authentication should work properly
3. You should be able to load transactions and other data

## Prevention
- Always ensure your PostgreSQL service is running before deploying backend changes
- Monitor Railway logs for database connection issues
- Use the health check script regularly: `npm run db:health`
