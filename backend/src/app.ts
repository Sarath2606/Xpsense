import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.routes';
import accountRoutes from './routes/accounts.routes';
import transactionRoutes from './routes/transactions.routes';
import webhookRoutes from './routes/webhooks.routes';
import consentRoutes from './routes/consent.routes';
import splitwiseRoutes from './routes/splitwise.routes';
import { verifyFirebaseToken } from './config/firebase';
import splitwiseInvitesRoutes from './routes/splitwise-invites.routes';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

// Load environment variables (resolve relative to compiled dist directory)
dotenv.config({ path: path.resolve(__dirname, '../env.local') });

const app = express();
const PORT = process.env.PORT || 3001;
const server = http.createServer(app);

// Resolve allowed origins from env (comma-separated)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

// Socket.IO setup
export const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }
});

io.use(async (socket, next) => {
  try {
    const token = (socket.handshake.auth?.token as string) || (socket.handshake.headers.authorization as string)?.replace('Bearer ', '') || '';
    if (!token) {
      // In development allow unauthenticated sockets with mock user
      if (process.env.NODE_ENV === 'development') {
        (socket as any).user = { id: 'dev-user-id', email: 'dev@example.com' };
        return next();
      }
      return next(new Error('Unauthorized'));
    }
    const decoded = await verifyFirebaseToken(token);
    (socket as any).user = { id: decoded.uid, email: decoded.email };
    return next();
  } catch (err) {
    return next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  socket.on('join:group', ({ groupId }) => {
    if (!groupId) return;
    socket.join(`group:${groupId}`);
  });
  socket.on('leave:group', ({ groupId }) => {
    if (!groupId) return;
    socket.leave(`group:${groupId}`);
  });
});

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting - more lenient in development
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute
  max: process.env.NODE_ENV === 'development' 
    ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5000') // 5000 requests per minute in development
    : parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 requests in production
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  skipFailedRequests: false, // Count failed requests
  handler: (req, res) => {
    console.log(`🚫 Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000') / 1000)
    });
  }
});

// Health check endpoint (no rate limiting)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Alias for health check under /api for compatibility with tooling/tests
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Apply rate limiting to API routes
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/consents', consentRoutes);
app.use('/api/splitwise', splitwiseRoutes);
// app.use('/api/splitwise', splitwiseInvitesRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;
