# Railway Database URL Setup Guide

## Problem
Your Railway deployment is failing because the `DATABASE_URL` environment variable is not properly configured.

## Solution: Configure Database URL in Railway

### Step 1: Check Your Railway Services

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Open your project
3. Verify you have **TWO services**:
   - ✅ Your backend service (Node.js)
   - ✅ A PostgreSQL database service

### Step 2: Link Database to Backend Service

1. **Click on your backend service**
2. **Go to "Variables" tab**
3. **Look for database URL variables**

Railway should automatically provide these variables when you link services:

#### **Primary Options (choose one):**
- `DATABASE_URL` - **RECOMMENDED** (internal Railway URL)
- `DATABASE_PUBLIC_URL` - External URL (if you need external access)

#### **Alternative Options:**
- `POSTGRES_URL`
- `POSTGRES_PUBLIC_URL`
- `PG_URL`
- `PG_PUBLIC_URL`

### Step 3: Add Database URL Variable

If the database URL is not automatically set:

1. **Click "New Variable"** in your backend service
2. **Name**: `DATABASE_URL`
3. **Value**: Copy from your PostgreSQL service

#### **How to get the database URL:**

1. **Go to your PostgreSQL service**
2. **Click "Connect" tab**
3. **Copy the "Connection String"**
4. **Paste it as the value for `DATABASE_URL`**

### Step 4: Verify the Database URL Format

Your `DATABASE_URL` should look like:
```
postgresql://postgres:password@postgres.railway.internal:5432/railway
```

Or for external access:
```
postgresql://postgres:password@containers-us-west-xxx.railway.app:xxxx/railway
```

### Step 5: Redeploy Your Backend

1. **Go to your backend service**
2. **Click "Deploy"** or trigger a new deployment
3. **Watch the logs** for successful database connection

### Step 6: Test Database Connection

After deployment, you should see these logs:
```
✅ Server running on port 8080
✅ Environment: production
✅ Database connection successful
```

## Troubleshooting

### Issue: "No database URL found"
**Solution**: Make sure `DATABASE_URL` is set in your Railway backend service variables

### Issue: "Can't reach database server"
**Solution**: 
1. Check if PostgreSQL service is running
2. Verify the database URL is correct
3. Ensure services are properly linked

### Issue: "Authentication failed"
**Solution**: 
1. Check database credentials in Railway
2. Verify the URL contains correct username/password

### Issue: "Database does not exist"
**Solution**: 
1. Railway should create the database automatically
2. If not, check the database name in the URL

## Quick Fix Commands

If you need to manually set the database URL:

```bash
# In Railway dashboard, add this variable to your backend service:
DATABASE_URL=postgresql://postgres:your-password@postgres.railway.internal:5432/railway
```

## Expected Results

After proper configuration:
- ✅ Backend deploys successfully
- ✅ Database connection established
- ✅ Authentication works properly
- ✅ No more 401 errors
- ✅ All app features functional

## Next Steps

1. **Configure the database URL** in Railway
2. **Redeploy your backend**
3. **Test your application**
4. **Monitor Railway logs** for success messages
