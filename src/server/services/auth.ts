import { Auth } from '../../firebase/app';
import fbClient from '@/providers/fb-client';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';
import { OnlyInstantiableByContainer, Singleton } from 'typescript-ioc';

@Singleton
@OnlyInstantiableByContainer
export class AuthService {
  public async checkUser(uid: string): Promise<UserRecord> {
    return Auth.getUser(uid);
  }

  public async signIn(email: string, password: string) {
    return await fbClient.post('accounts:signInWithPassword', {
      email,
      password,
      returnSecureToken: true
    });
  }
}
