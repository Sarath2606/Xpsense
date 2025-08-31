# Xpenses Backend - Mastercard Open Banking Integration

## 🎯 Overview

This backend service integrates with Mastercard Open Banking API to provide real-time bank account data, transactions, and balances for the Xpenses expense tracking application. **The application now uses Mastercard sandbox data exclusively - no mock data is used.**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- Mastercard Open Banking API credentials

### Installation

1. **Clone and install dependencies:**
```bash
cd backend
npm install
```

2. **Set up environment variables:**
```bash
cp env.example .env
# Edit .env with your Mastercard API credentials
```

3. **Set up database:**
```bash
npm run db:generate
npm run db:push
```

4. **Start the server:**
```bash
npm run dev
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `backend/` directory:

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

## 🧪 Testing

### Test Sandbox Integration

Run the sandbox integration test to verify everything is working:

```bash
node test-sandbox-integration.js
```

This will:
- ✅ Check your environment configuration
- ✅ Test sandbox accessibility
- ✅ Verify available institutions
- ✅ Test OAuth URL generation
- ✅ Check backend server status

### Manual Testing

1. **Start both servers:**
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
npm start
```

2. **Test the flow:**
   - Open `http://localhost:3002`
   - Register/login with Firebase
   - Click "Connect Bank Account"
   - Complete OAuth flow with sandbox banks
   - View your connected accounts and transactions

## 📊 Features

### ✅ What's Working (Sandbox Data)

- **Real OAuth Flow**: Complete authentication with Mastercard sandbox
- **Bank Account Connection**: Connect to sandbox financial institutions
- **Account Balances**: Real-time balance data from sandbox accounts
- **Transaction Sync**: Historical and real-time transaction data
- **CDR Compliance**: Full consent management and audit logging
- **Token Management**: Automatic token refresh and encryption
- **Webhook Support**: Real-time updates from sandbox banks

### 🏦 Available Sandbox Banks

The Mastercard sandbox provides access to:
- **Commonwealth Bank** (CBA)
- **Westpac**
- **ANZ**
- **NAB**
- **Other Australian banks**

### 📈 Data Types

- **Accounts**: Checking, savings, credit accounts
- **Balances**: Current, available, credit limits
- **Transactions**: Debits, credits, transfers with categories
- **Consent**: CDR-compliant consent management

## 🔒 Security & Compliance

### CDR Compliance Features

- ✅ **Consent Management**: Max 12 months, granular scopes
- ✅ **Data Protection**: Encrypted token storage
- ✅ **Audit Logging**: Complete access trail
- ✅ **User Rights**: Consent dashboard, data export
- ✅ **Token Security**: OAuth 2.0 with PKCE

### Security Measures

- OAuth 2.0 with PKCE
- Encrypted token storage
- Rate limiting
- CORS protection
- Input validation
- Audit logging

## 🚫 No Mock Data

**Important**: This application no longer uses mock data. All data comes from the Mastercard sandbox environment, providing:

- ✅ **Realistic Testing**: Actual bank-like data
- ✅ **API Compliance**: Real API endpoints and responses  
- ✅ **Production Parity**: Same structure as production
- ✅ **OAuth Flow**: Complete authentication testing
- ✅ **Webhook Testing**: Real notifications

## 🔍 Troubleshooting

### Common Issues

1. **Sandbox Unavailable (503 errors)**
   - Wait 15-60 minutes (temporary maintenance)
   - Check different times (avoid maintenance windows)
   - Verify credentials are correct

2. **Authentication Errors**
   - Check environment variables
   - Verify sandbox account is active
   - Ensure correct environment (sandbox vs production)

3. **Database Issues**
   - Run `npm run db:push` to create tables
   - Check PostgreSQL connection
   - Verify DATABASE_URL format

### Health Checks

```bash
# Test sandbox connectivity
node test-sandbox-integration.js

# Check database
npm run db:push

# Test backend server
curl http://localhost:3001/api/health
```

## 📚 API Documentation

### Key Endpoints

```http
# Authentication
POST   /api/auth/consent/start     # Start OAuth flow
GET    /api/auth/callback          # OAuth callback
POST   /api/auth/refresh           # Refresh tokens

# Consent Management  
GET    /api/consents               # List user consents
GET    /api/consents/:id           # Get consent details
DELETE /api/consents/:id           # Revoke consent

# Account Management
GET    /api/accounts               # Get connected accounts
GET    /api/accounts/:id/balances  # Get account balances
GET    /api/accounts/:id/transactions # Get transactions

# Sync Operations
POST   /api/sync/initial/:consentId    # Initial sync
POST   /api/sync/incremental/:consentId # Incremental sync
POST   /api/sync/account/:accountId    # Sync specific account
```

## 🚀 Deployment

### Production Checklist

- [ ] Update environment variables for production
- [ ] Set up production database
- [ ] Configure CORS for production domain
- [ ] Set up monitoring and logging
- [ ] Configure webhook endpoints
- [ ] Test with production Mastercard credentials

### Environment Variables for Production

```env
NODE_ENV=production
MASTERCARD_API_BASE_URL=https://api.mastercard.com/open-banking
MASTERCARD_AUTH_URL=https://api.mastercard.com/oauth2/token
# Use production Mastercard credentials
```

## 📞 Support

- **Mastercard API Docs**: [Open Banking Documentation](https://developer.mastercard.com/open-banking)
- **CDR Compliance**: [Consumer Data Right](https://www.accc.gov.au/focus-areas/consumer-data-right-cdr-0)
- **Sandbox Status**: Check Mastercard developer portal

---

**🎉 Your application is now fully integrated with Mastercard Open Banking sandbox!**
