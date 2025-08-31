import { Response } from 'express';
export declare class AccountsController {
    getConnectedAccounts: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getConnectedAccount: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    syncAllAccounts: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    syncAccount: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    disconnectAccount: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getSyncStatus: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getBalanceSummary: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
export declare const accountsController: AccountsController;
//# sourceMappingURL=accounts.controller.d.ts.map