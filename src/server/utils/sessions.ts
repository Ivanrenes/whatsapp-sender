/**
 * The Singleton class defines the `getInstance` method that lets clients access
 * the unique singleton instance.
 */

import fs from 'fs';
import { wppClientBuilder } from '@/providers/wpp-client';
import { waitFor } from 'poll-until-promise';
import WAWebJS from 'whatsapp-web.js';
import path from 'path';

interface Session {
  qr?: string;
  client: WAWebJS.Client;
  startTime?: number;
  endTime?: number;
  initialized: boolean;
}

export class Sessions {
  private static instance: Sessions;
  sessions: Map<string, Session> = new Map();
  sessionFolderPath = `${process.env.SESSION_FOLDER_PATH}` || './sessions';

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

  public get(k: string) {
    return this.sessions.get(k);
  }

  public size() {
    return this.sessions.size;
  }

  public async setUpSession(sessionId: string, sessionInfo?: Session) {
    try {
      if (this.sessions.has(sessionId)) {
        console.log(
          `[${Sessions.name}] Session already exists for:`,
          sessionId
        );
        return {
          success: false,
          message: `Session already exists for: ${sessionId}`,
          session: this.sessions.get(sessionId)
        };
      }

      console.log(`[${Sessions.name}] Setting up session for:`, sessionId);
      const client = wppClientBuilder(sessionId);

      console.log(`[${Sessions.name}] Initializing client for:`, sessionId);
      client
        .initialize()
        .then(() => {})
        .catch((err) =>
          console.log(`[${Sessions.name}] Client Initialize error:`, err)
        );

      console.log(
        `[${Sessions.name}] Client start up check process for :`,
        sessionId
      );

      await this.startUp(sessionId, client);

      console.log(`[${Sessions.name}] Client started up! :`, sessionId);

      // Save the session to the Map
      this.sessions.set(sessionId, {
        client,
        startTime: sessionInfo?.startTime,
        endTime: sessionInfo?.endTime,
        initialized: true,
        qr: sessionInfo?.qr
      });

      console.log(`[${Sessions.name}] Client Initialized for:`, sessionId);

      return {
        success: true,
        message: 'Session initiated successfully',
        session: this.sessions.get(sessionId)
      };
    } catch (error) {
      console.log(
        `[${Sessions.name}] Error occurred while setting up session:`,
        error
      );
      return {
        success: false,
        message: 'Error occurred while setting up session',
        error
      };
    }
  }

  public async restartSession(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (session) {
      try {
        console.log(`[${Sessions.name}] Restarting session:`, sessionId);
        await session.client.destroy();
        this.sessions.delete(sessionId);
        await this.deleteSession(sessionId);
        return await this.setUpSession(sessionId);
      } catch (error) {
        console.log(
          `[${Sessions.name}] Error occurred while setting up session:`,
          error
        );
        return {
          success: false,
          message: 'Error occurred while setting up session',
          error,
          session: undefined
        };
      }
    }
    return {
      success: false,
      message: 'Session not found',
      error: 'Session not found',
      session: undefined
    };
  }

  public async startUp(sessionId: string, client: WAWebJS.Client) {
    console.log(
      `[${Sessions.name}] Waiting for Puppeteer page for ${sessionId}`
    );
    const clientWithPupPage = await waitFor(
      () => {
        // eslint-disable-next-line no-async-promise-executor
        if (!client.pupPage) {
          throw new Error('Puppeteer page not found');
        } else {
          return client;
        }
      },
      { timeout: 3000 }
    );

    console.log(`[${Sessions.name}] Puppeteer done! ${sessionId}`);

    if (!clientWithPupPage.pupPage) {
      console.log('Puppeteer page not found');
      return;
    }

    clientWithPupPage.pupPage!.once('close', async () => {
      // emitted when the page closes
      console.log(
        `[${Sessions.name}] Browser page closed for ${sessionId}. Restoring`
      );
      await this.restartSession(sessionId);
    });
    clientWithPupPage.pupPage!.once('error', async () => {
      // emitted when the page crashes
      console.log(
        `[${Sessions.name}] Error occurred on browser page for ${sessionId}. Restoring`
      );
      await this.restartSession(sessionId);
    });
  }

  public async restoreSessions() {
    try {
      if (!fs.existsSync(this.sessionFolderPath)) {
        fs.mkdirSync(this.sessionFolderPath); // Create the session directory if it doesn't exist
      }
      // Read the contents of the folder
      fs.readdir(this.sessionFolderPath, (_, files) => {
        // Iterate through the files in the parent folder
        for (const file of files) {
          // Use regular expression to extract the string from the folder name
          const match = file.match(/^session-(.+)$/);
          if (match) {
            const sessionId = match[1];
            console.log(
              `[${Sessions.name}] Existing session detected`,
              sessionId
            );
            this.setUpSession(sessionId);
          }
        }
      });
    } catch (error) {
      console.error(`[${Sessions.name}] Failed to restore sessions:`, error);
    }
  }

  public async deleteSessionFolder(sessionId: string) {
    try {
      const targetDirPath = path.join(
        this.sessionFolderPath,
        `session-${sessionId}`
      );
      const resolvedTargetDirPath = await fs.promises.realpath(targetDirPath);
      const resolvedSessionPath = await fs.promises.realpath(
        this.sessionFolderPath
      );

      // Ensure the target directory path ends with a path separator
      const safeSessionPath = `${resolvedSessionPath}${path.sep}`;

      // Validate the resolved target directory path is a subdirectory of the session folder path
      if (!resolvedTargetDirPath.startsWith(safeSessionPath)) {
        throw new Error('Invalid path: Directory traversal detected');
      }
      await fs.promises.rm(resolvedTargetDirPath, {
        recursive: true,
        force: true
      });
    } catch (error) {
      console.log('Folder deletion error', error);
      throw error;
    }
  }
  public async deleteSession(sessionId: string) {
    try {
      const client = this.sessions.get(sessionId)?.client;

      if (!client) {
        return;
      }

      client.pupPage?.removeAllListeners('close');
      client.pupPage?.removeAllListeners('error');

      console.log(`[LOGGING OUT] Logging out session ${sessionId}`);

      console.log(`[LOGGING OUT] Destroying session ${sessionId}`);
      await client.destroy();

      // Wait for client.pupBrowser to be disconnected before deleting the folder
      while (client.pupBrowser!.isConnected()) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      await this.deleteSessionFolder(sessionId);
      this.sessions.delete(sessionId);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  public async flushSessions(deleteOnlyInactive: boolean) {
    try {
      // Read the contents of the sessions folder
      const files = await fs.promises.readdir(this.sessionFolderPath);
      // Iterate through the files in the parent folder
      for (const file of files) {
        // Use regular expression to extract the string from the folder name
        const match = file.match(/^session-(.+)$/);
        if (match) {
          const sessionId = match[1];

          //  TODO: CHECK IF SESSION IS STILL ACTIVE
          if (deleteOnlyInactive) {
            await this.deleteSession(sessionId);
          }
        }
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  public modifySession(sessionId: string, sessionInfo: Partial<Session>) {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.sessions.set(sessionId, { ...session, ...sessionInfo });
    }
  }
}
