"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
require("./config/database");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const accounts_routes_1 = __importDefault(require("./routes/accounts.routes"));
const transactions_routes_1 = __importDefault(require("./routes/transactions.routes"));
const webhooks_routes_1 = __importDefault(require("./routes/webhooks.routes"));
const consent_routes_1 = __importDefault(require("./routes/consent.routes"));
const splitwise_routes_1 = __importDefault(require("./routes/splitwise.routes"));
const firebase_1 = require("./config/firebase");
const splitwise_invites_routes_1 = __importDefault(require("./routes/splitwise-invites.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../env.local') });
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3001;
const server = http_1.default.createServer(app);
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);
function isOriginAllowed(origin) {
    if (!origin)
        return true;
    try {
        const url = new URL(origin);
        const host = url.hostname.toLowerCase();
        if (allowedOrigins.includes(origin))
            return true;
        if (host.endsWith('.xpenses-app.pages.dev'))
            return true;
        if (host.endsWith('.vercel.app'))
            return true;
        return false;
    }
    catch {
        return allowedOrigins.includes(origin);
    }
}
exports.io = new socket_io_1.Server(server, {
    cors: {
        origin: (origin, callback) => {
            if (isOriginAllowed(origin))
                return callback(null, true);
            callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }
});
exports.io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.replace('Bearer ', '') || '';
        if (!token) {
            if (process.env.NODE_ENV === 'development') {
                socket.user = { id: 'dev-user-id', email: 'dev@example.com' };
                return next();
            }
            return next(new Error('Unauthorized'));
        }
        const decoded = await (0, firebase_1.verifyFirebaseToken)(token);
        const userEmail = (decoded.email || '').toLowerCase();
        const dbUser = await prisma.user.upsert({
            where: { email: userEmail },
            update: {
                name: decoded.name || userEmail.split('@')[0],
                firebaseUid: decoded.uid
            },
            create: {
                email: userEmail,
                name: decoded.name || userEmail.split('@')[0],
                firebaseUid: decoded.uid
            }
        });
        socket.user = { id: dbUser.id, email: dbUser.email };
        return next();
    }
    catch (err) {
        console.error('Socket authentication error:', err);
        return next(new Error('Unauthorized'));
    }
});
exports.io.on('connection', (socket) => {
    socket.on('join:group', ({ groupId }) => {
        if (!groupId)
            return;
        socket.join(`group:${groupId}`);
    });
    socket.on('leave:group', ({ groupId }) => {
        if (!groupId)
            return;
        socket.leave(`group:${groupId}`);
    });
});
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (isOriginAllowed(origin))
            return callback(null, true);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
    max: process.env.NODE_ENV === 'development'
        ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5000')
        : parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    skipFailedRequests: false,
    handler: (req, res) => {
        console.log(`🚫 Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            error: 'Too many requests from this IP, please try again later.',
            retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000') / 1000)
        });
    }
});
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});
app.use('/api/', limiter);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, compression_1.default)());
if (process.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
else {
    app.use((0, morgan_1.default)('combined'));
}
app.use('/api/auth', auth_routes_1.default);
app.use('/api/accounts', accounts_routes_1.default);
app.use('/api/transactions', transactions_routes_1.default);
app.use('/api/webhooks', webhooks_routes_1.default);
app.use('/api/consents', consent_routes_1.default);
app.use('/api/splitwise', splitwise_routes_1.default);
app.use('/api/splitwise', splitwise_invites_routes_1.default);
app.use(error_middleware_1.notFoundHandler);
app.use(error_middleware_1.errorHandler);
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
exports.default = app;
//# sourceMappingURL=app.js.map