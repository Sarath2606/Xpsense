import { Response } from 'express';
import { FirebaseAuthRequest } from '../middleware/firebase-auth.middleware';
export declare class SplitwiseExpensesController {
    static createExpense(req: FirebaseAuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getGroupExpenses(req: FirebaseAuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getExpense(req: FirebaseAuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static updateExpense(req: FirebaseAuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static deleteExpense(req: FirebaseAuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getSplitTypes(req: FirebaseAuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=splitwise-expenses.controller.d.ts.map