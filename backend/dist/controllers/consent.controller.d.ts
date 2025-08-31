import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class ConsentController {
    startConsent(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    handleCallback(req: Request, res: Response): Promise<void>;
    getUserConsents(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    revokeConsent(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getConsentDetails(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    checkSandboxStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    private logAuditEvent;
}
export declare const consentController: ConsentController;
//# sourceMappingURL=consent.controller.d.ts.map