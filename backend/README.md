# Xpenses Backend

A comprehensive backend API for the Xpenses application with Mastercard Open Banking integration.

## Features

- **User Authentication**: JWT-based authentication system
- **Open Banking Integration**: Mastercard Open Banking API integration
- **Account Management**: Connect and manage multiple bank accounts
- **Transaction Sync**: Automatic transaction synchronization from connected accounts
- **Real-time Updates**: Webhook handling for real-time data updates
- **Transaction Management**: CRUD operations for transactions
- **Data Security**: Encrypted storage of sensitive data
- **Comprehensive Logging**: Detailed logging for debugging and monitoring

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **API Integration**: Mastercard Open Banking APIs
- **Security**: Helmet, CORS, Rate limiting
- **Logging**: Custom logger with Morgan

## Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- Mastercard Open Banking Developer Account

## Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
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
   MASTERCARD_CLIENT_ID=your-mastercard-client-id
   MASTERCARD_CLIENT_SECRET=your-mastercard-client-secret
   MASTERCARD_API_BASE_URL=https://sandbox.api.mastercard.com/open-banking
   MASTERCARD_AUTH_URL=https://sandbox.api.mastercard.com/oauth2/token
   
   # OAuth Redirect URLs
   OAUTH_REDIRECT_URI=http://localhost:3001/api/auth/callback
   
   # CORS Configuration
   FRONTEND_URL=http://localhost:3000
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   
   # Logging
   LOG_LEVEL=debug
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/oauth/initiate` - Initiate OAuth flow
- `GET /api/auth/callback` - OAuth callback handler
- `POST /api/auth/connect-bank` - Connect bank account
- `POST /api/auth/refresh-token` - Refresh JWT token

### Connected Accounts

- `GET /api/accounts` - Get all connected accounts
- `GET /api/accounts/:accountId` - Get specific account
- `POST /api/accounts/sync` - Sync all accounts
- `POST /api/accounts/:accountId/sync` - Sync specific account
- `DELETE /api/accounts/:accountId` - Disconnect account
- `GET /api/accounts/sync-status` - Get sync status
- `GET /api/accounts/balance-summary` - Get balance summary

### Transactions

- `GET /api/transactions` - Get all transactions (with filtering)
- `GET /api/transactions/:transactionId` - Get specific transaction
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:transactionId` - Update transaction
- `DELETE /api/transactions/:transactionId` - Delete transaction
- `GET /api/transactions/stats` - Get transaction statistics

### Webhooks

- `POST /api/webhooks/mastercard` - Mastercard webhook endpoint
- `GET /api/webhooks/events` - Get webhook events
- `PATCH /api/webhooks/events/:eventId/processed` - Mark event as processed

## Database Schema

### Users
- Basic user information
- Email and name

### Connected Accounts
- Bank account details
- OAuth tokens (encrypted)
- Balance and sync information

### Transactions
- Transaction details
- Source tracking (manual vs imported)
- Category and metadata

### Webhook Events
- Incoming webhook data
- Processing status

## Mastercard Open Banking Integration

### OAuth Flow
1. User initiates OAuth flow
2. Redirect to Mastercard authorization
3. User consents and authorizes
4. Exchange code for access token
5. Connect accounts to user

### Data Synchronization
- Automatic balance updates
- Transaction import
- Real-time webhook processing
- Token refresh handling

### Security Features
- Encrypted token storage
- Webhook signature validation
- Rate limiting
- CORS protection

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
```

### Project Structure

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── app.ts          # Main application
├── prisma/
│   └── schema.prisma   # Database schema
├── package.json
└── tsconfig.json
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `PORT` | Server port | No (default: 3001) |
| `JWT_SECRET` | JWT signing secret | Yes |
| `MASTERCARD_CLIENT_ID` | Mastercard API client ID | Yes |
| `MASTERCARD_CLIENT_SECRET` | Mastercard API client secret | Yes |
| `MASTERCARD_API_BASE_URL` | Mastercard API base URL | No |
| `OAUTH_REDIRECT_URI` | OAuth callback URL | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |

## Security Considerations

- All sensitive data is encrypted before storage
- JWT tokens have expiration times
- Rate limiting prevents abuse
- CORS is configured for security
- Input validation on all endpoints
- Webhook signature validation

## Error Handling

The API uses a centralized error handling system:
- Consistent error response format
- Proper HTTP status codes
- Detailed logging for debugging
- User-friendly error messages

## Logging

The application uses a custom logger with:
- Different log levels (info, warn, error, debug)
- Request/response logging
- API call logging
- Error tracking

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**

3. **Start the production server**
   ```bash
   npm start
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
