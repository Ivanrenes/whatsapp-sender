import { Readable } from 'stream';

/**
 * The Singleton class defines the `getInstance` method that lets clients access
 * the unique singleton instance.
 */

interface Session {
  stream: Readable;
  startTime: number;
  endTime: number;
}
export class Sessions {
  private static instance: Sessions;
  sessions: Map<string, Session> = new Map();

  /**
   * The Singleton's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  private constructor() {}

  /**
   * The static method that controls the access to the singleton instance.
   *
   * This implementation let you subclass the Singleton class while keeping
   * just one instance of each subclass around.
   */
  public static getInstance(): Sessions {
    if (!Sessions.instance) {
      Sessions.instance = new Sessions();
    }

    return Sessions.instance;
  }

  /**
   * Finally, any singleton should define some business logic, which can be
   * executed on its instance.
   */
  public set(k: string, v: Session) {
    this.sessions.set(k, v);
  }

  public get(k: string) {
    return this.sessions.get(k);
  }

  public size() {
    return this.sessions.size;
  }

  public clear() {
    this.sessions.clear();
  }

  public delete(k: string) {
    this.sessions.delete(k);
  }

  public keys() {
    return this.sessions.keys();
  }
}
