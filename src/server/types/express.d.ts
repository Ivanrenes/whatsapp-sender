import { UserRecord } from 'firebase-admin/lib/auth/user-record';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: UserRecord;
    }
  }
}
