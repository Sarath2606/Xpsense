import { Response } from 'express';
import { FirebaseAuthRequest } from '../middleware/firebase-auth.middleware';
export declare class SplitwiseGroupsController {
    static createGroup(req: FirebaseAuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getMyGroups(req: FirebaseAuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getGroupDetails(req: FirebaseAuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static updateGroup(req: FirebaseAuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static deleteGroup(req: FirebaseAuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static addMember(req: FirebaseAuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static removeMember(req: FirebaseAuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static updateMemberRole(req: FirebaseAuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=splitwise-groups.controller.d.ts.map