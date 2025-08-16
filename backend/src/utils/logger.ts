// Custom logger for development and production
export const logger = {
  info: (message: string, meta?: any) => {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`, meta || '');
  },
  
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error || '');
  },
  
  warn: (message: string, meta?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, meta || '');
  },
  
  debug: (message: string, meta?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${new Date().toISOString()}: ${message}`, meta || '');
    }
  }
};

// Morgan stream for HTTP request logging
export const morganStream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};

// Custom morgan format for development
export const morganFormat = process.env.NODE_ENV === 'development' 
  ? 'dev' 
  : 'combined';
