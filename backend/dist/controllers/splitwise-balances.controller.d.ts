import { Response } from 'express';
import { FirebaseAuthRequest } from '../middleware/firebase-auth.middleware';
export declare class SplitwiseBalancesController {
    static getGroupBalances(req: FirebaseAuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getMyBalance(req: FirebaseAuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getMyGroupBalances(req: FirebaseAuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static validateGroupBalances(req: FirebaseAuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getBalanceHistory(req: FirebaseAuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getSettlementSuggestions(req: FirebaseAuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=splitwise-balances.controller.d.ts.map