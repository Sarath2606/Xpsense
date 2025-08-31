"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.morganFormat = exports.morganStream = exports.logger = void 0;
exports.logger = {
    info: (message, meta) => {
        console.log(`[INFO] ${new Date().toISOString()}: ${message}`, meta || '');
    },
    error: (message, error) => {
        console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error || '');
    },
    warn: (message, meta) => {
        console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, meta || '');
    },
    debug: (message, meta) => {
        if (process.env.NODE_ENV === 'development') {
            console.debug(`[DEBUG] ${new Date().toISOString()}: ${message}`, meta || '');
        }
    }
};
exports.morganStream = {
    write: (message) => {
        exports.logger.info(message.trim());
    }
};
exports.morganFormat = process.env.NODE_ENV === 'development'
    ? 'dev'
    : 'combined';
//# sourceMappingURL=logger.js.map