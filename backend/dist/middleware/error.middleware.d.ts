import { Request, Response, NextFunction } from 'express';
export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
    code?: number;
}
export declare const errorHandler: (error: AppError, req: Request, res: Response, next: NextFunction) => void;
export declare const notFoundHandler: (req: Request, res: Response, next: NextFunction) => void;
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=error.middleware.d.ts.map