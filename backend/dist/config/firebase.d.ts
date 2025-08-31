import * as admin from 'firebase-admin';
declare const initializeFirebase: () => admin.app.App | null;
export declare const getFirebaseAuth: () => import("firebase-admin/lib/auth/auth").Auth;
export declare const verifyFirebaseToken: (idToken: string) => Promise<{
    uid: string;
    email: string | undefined;
    name: any;
    picture: string | undefined;
}>;
export default initializeFirebase;
//# sourceMappingURL=firebase.d.ts.map