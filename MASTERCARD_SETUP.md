# Mastercard Open Banking API Setup

## 🔑 Your API Credentials

Here are your Mastercard Open Banking API credentials for sandbox testing:

```
Partner ID: 2445584957219
App Key: 5ad34a4227b6c585beaa8dc7e1d2d2f5
Secret: QFgTbpYOHHPBU8xfFZ5p
```

## 📝 Environment Configuration

Create a `.env` file in your `backend/` directory with the following content:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:2606@localhost:5432/Xpense Backend"

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Mastercard Open Banking API Configuration
MASTERCARD_PARTNER_ID=2445584957219
MASTERCARD_CLIENT_ID=5ad34a4227b6c585beaa8dc7e1d2d2f5
MASTERCARD_CLIENT_SECRET=QFgTbpYOHHPBU8xfFZ5p
MASTERCARD_API_BASE_URL=https://api.openbanking.mastercard.com.au
MASTERCARD_AUTH_URL=https://api.openbanking.mastercard.com.au/oauth2/token

# OAuth Redirect URLs
OAUTH_REDIRECT_URI=http://localhost:3001/api/auth/callback

# CORS Configuration
FRONTEND_URL=http://localhost:3002

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug
```

## 🚀 Testing Steps

### 1. Start the Backend
```bash
cd backend
npm install
npm run db:generate
npm run db:push
npm run dev
```

### 2. Start the Frontend
```bash
# In a new terminal
npm start
```

### 3. Test the Integration
1. Open your app at `http://localhost:3002`
2. Register a new account or login
3. Click "Connect Bank Account"
4. Complete the Mastercard OAuth flow
5. View your connected accounts and transactions

## 🧪 What You Can Test

With these sandbox credentials, you can test:

- ✅ **OAuth Authentication Flow**
- ✅ **Bank Account Connection**
- ✅ **Account Balance Retrieval**
- ✅ **Transaction Synchronization**
- ✅ **Webhook Notifications**

## 📊 Sandbox Features

The Mastercard sandbox provides:
- **Mock Banks:** Sample financial institutions
- **Test Accounts:** Checking, savings, and credit accounts
- **Sample Transactions:** Realistic transaction data
- **OAuth Simulation:** Complete authorization flow
- **Webhook Testing:** Simulated bank updates

## 🔍 Troubleshooting

If you encounter issues:

1. **Check Environment Variables:**
   - Ensure `.env` file is in the `backend/` directory
   - Verify all credentials are correct
   - No extra spaces or quotes around values

2. **Database Setup:**
   - Make sure PostgreSQL is running
   - Run `npm run db:push` to create tables

3. **API Connection:**
   - Check backend logs for API errors
   - Verify CORS configuration
   - Ensure both servers are running

## 📞 Support

Your Mastercard API credentials are now configured and ready for testing! 🎉

The sandbox environment will provide realistic data for testing all features of your expense tracking application.
