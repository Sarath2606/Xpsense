import { Request, Response, NextFunction } from 'express';
export interface FirebaseAuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        name?: string;
        firebaseUid: string;
    };
}
export declare const authenticateFirebaseToken: (req: FirebaseAuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const optionalFirebaseAuth: (req: FirebaseAuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=firebase-auth.middleware.d.ts.map