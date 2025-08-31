import { Request, Response } from 'express';
export declare class TransactionsController {
    getAllTransactions: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getTransaction: (req: Request, res: Response, next: import("express").NextFunction) => void;
    createTransaction: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateTransaction: (req: Request, res: Response, next: import("express").NextFunction) => void;
    deleteTransaction: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getTransactionStats: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
export declare const transactionsController: TransactionsController;
//# sourceMappingURL=transactions.controller.d.ts.map