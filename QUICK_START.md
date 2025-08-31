# Quick Start Guide

## 🚀 Get Your App Running

### Step 1: Start the Backend Server

Open a terminal and run:
```bash
cd backend
npm install
npm run db:generate
npm run db:push
npm run dev
```

You should see:
```
🚀 Server running on port 3001
📊 Environment: development
🔗 Health check: http://localhost:3001/health
```

### Step 2: Start the Frontend Server

Open a **new terminal** and run:
```bash
npm install
npm start
```

You should see:
```
Local:            http://localhost:3002
On Your Network:  http://192.168.x.x:3002
```

### Step 3: Test the Application

1. **Open your browser** and go to: `http://localhost:3002`
2. **Register a new account** or login
3. **Click "Connect Bank Account"**
4. **Click "Authorize Access"** - this should now open the real Mastercard OAuth page

## 🔧 Troubleshooting

### If you see "Route / not found":
- Make sure you're accessing `http://localhost:3002` (frontend) not `http://localhost:3001` (backend)
- The backend only serves API endpoints, not the web interface

### If OAuth still shows "example-bank.com":
- Make sure both servers are running
- Check that you have the `.env` file in the `backend/` directory with your Mastercard credentials

### If servers won't start:
- Check if ports 3001 and 3002 are available
- Make sure PostgreSQL is running
- Verify all dependencies are installed

## 📋 Your Mastercard Credentials

Make sure your `backend/.env` file contains:
```env
MASTERCARD_PARTNER_ID=2445584957219
MASTERCARD_CLIENT_ID=5ad34a4227b6c585beaa8dc7e1d2d2f5
MASTERCARD_CLIENT_SECRET=QFgTbpYOHHPBU8xfFZ5p
```

## 🎯 Expected Flow

1. **Frontend**: `http://localhost:3002` - Your React app
2. **Backend**: `http://localhost:3001` - API server
3. **OAuth**: `https://api.openbanking.mastercard.com.au/oauth2/authorize` - Mastercard authorization

## ✅ Success Indicators

- ✅ Backend shows "Server running on port 3001"
- ✅ Frontend opens at `http://localhost:3002`
- ✅ "Connect Bank Account" button works
- ✅ "Authorize Access" opens Mastercard OAuth page
- ✅ No more "example-bank.com" errors

Your app should now be fully functional with Mastercard Open Banking API! 🎉
