import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        name?: string;
    };
}
export declare const authenticateToken: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map