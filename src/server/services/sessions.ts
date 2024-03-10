import { Session, sessionRepository } from '@/models/session';
import { Singleton } from 'typescript-ioc';

@Singleton
export class SessionsService {
  public async createSession(uid: string) {
    const session = new Session();
    session.uid = uid;
    return sessionRepository.create(session);
  }

  public async getSession(uid: string) {
    return sessionRepository.whereEqualTo('uid', uid).findOne();
  }

  public async deleteSession(uid: string) {
    const session = await sessionRepository.whereEqualTo('uid', uid).findOne();
    if (session) {
      return sessionRepository.delete(session.id);
    }
    return null;
  }

  public async deleteAllSessions() {
    const sessions = await sessionRepository.find();
    return Promise.all(
      sessions.map((session) => sessionRepository.delete(session.id))
    );
  }

  public async getSessions() {
    return sessionRepository.find();
  }
}
