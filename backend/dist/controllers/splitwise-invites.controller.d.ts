import { Request, Response } from 'express';
import { FirebaseAuthRequest } from '../middleware/firebase-auth.middleware';
export declare class SplitwiseInvitesController {
    static checkSmtpHealth(req: Request, res: Response): Promise<void>;
    static sendInvite(req: FirebaseAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static acceptInvite(req: FirebaseAuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getPendingInvites(req: FirebaseAuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static cancelInvite(req: FirebaseAuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    private static sendInvitationEmail;
}
//# sourceMappingURL=splitwise-invites.controller.d.ts.map