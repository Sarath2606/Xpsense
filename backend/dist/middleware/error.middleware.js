"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.notFoundHandler = exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
const errorHandler = (error, req, res, next) => {
    let { statusCode = 500, message } = error;
    logger_1.logger.error(`Error ${statusCode}: ${message}`, {
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        stack: error instanceof Error ? error.stack : undefined
    });
    if (error.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation Error';
    }
    else if (error.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format';
    }
    else if (error.code === 11000) {
        statusCode = 409;
        message = 'Duplicate field value';
    }
    else if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    else if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }
    if (process.env.NODE_ENV === 'production' && statusCode === 500) {
        message = 'Internal server error';
    }
    res.status(statusCode).json({
        error: {
            message,
            statusCode,
            ...(process.env.NODE_ENV === 'development' && { stack: error instanceof Error ? error.stack : undefined })
        }
    });
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res, next) => {
    const error = new Error(`Route ${req.originalUrl} not found`);
    error.statusCode = 404;
    next(error);
};
exports.notFoundHandler = notFoundHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=error.middleware.js.map