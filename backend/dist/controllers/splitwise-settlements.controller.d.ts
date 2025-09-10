import { Response } from 'express';
import { FirebaseAuthRequest } from '../middleware/firebase-auth.middleware';
export declare class SplitwiseSettlementsController {
    static createSettlement(req: FirebaseAuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getGroupSettlements(req: FirebaseAuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getSettlement(req: FirebaseAuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static updateSettlement(req: FirebaseAuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static deleteSettlement(req: FirebaseAuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getUserSettlements(req: FirebaseAuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=splitwise-settlements.controller.d.ts.map