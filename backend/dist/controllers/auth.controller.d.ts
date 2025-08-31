import { Request, Response } from 'express';
export declare class AuthController {
    register: (req: Request, res: Response, next: import("express").NextFunction) => void;
    login: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getProfile: (req: Request, res: Response, next: import("express").NextFunction) => void;
    private getOrCreateFirebaseUser;
    initiateOAuth: (req: Request, res: Response, next: import("express").NextFunction) => void;
    oauthCallback: (req: Request, res: Response, next: import("express").NextFunction) => void;
    connectBankAccount: (req: Request, res: Response, next: import("express").NextFunction) => void;
    refreshToken: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
export declare const authController: AuthController;
//# sourceMappingURL=auth.controller.d.ts.map