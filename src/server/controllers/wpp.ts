import WAWebJS from 'whatsapp-web.js';
import {
  Controller,
  Get,
  Middlewares,
  Request,
  Route,
  Security,
  Response
} from 'tsoa';
import { PassThrough, Readable } from 'stream';
import { addMinutes, getUnixTime } from 'date-fns';
import { Sessions } from '../utils/sessions';
import { generateQr } from '../utils/qr';
import { checkSession } from '@/middlewares/check-session';
import { wppClientBuilder } from '@/providers/wpp-client';
import { Request as ExRequest } from 'express';
import { SessionsService } from '@/services/sessions';
import { Inject } from 'typescript-ioc';
import { SessionNotFoundError } from '@/middlewares/error-handling';

@Route('/wpp')
export default class WppController extends Controller {
  @Inject
  private readonly sessionsService!: SessionsService;
  readonly #sessionsManager = Sessions.getInstance();

  @Security('fb-token')
  @Get('/auth')
  @Response('200', 'Success', 'sdsd')
  public async initializeWebQR(@Request() req: ExRequest) {
    this.setHeader('Content-Type', 'image/png');

    const stream = new PassThrough();
    const user = req!.body!.user;
    const currentSession = this.#sessionsManager.get(user.uid);
    const now = getUnixTime(new Date());

    if (currentSession !== undefined && now < currentSession.endTime!) {
      console.log(
        `[AUTH PROCESS IN PROGRESS] Session attempt is still valid for ${user.uid}`
      );

      await generateQr(stream, currentSession.qr!);
      return stream as Readable;
    }

    console.log('[AUTH PROCESS IN PROGRESS] Setting up new session...');
    const setUpSession = await this.#sessionsManager.setUpSession(user.uid);
    console.log('[AUTH PROCESS IN PROGRESS] Session set up process done!');

    if (!setUpSession.success && setUpSession.session) {
      const res = await this.#sessionsManager.restartSession(user.uid);

      if (!res.success) {
        return;
      }

      if (res.success && res.session) {
        setUpSession.session = res.session;
      }
    }

    const QRreadStream: Promise<Readable> = new Promise((resolve, reject) => {
      console.log('[AUTH PROCESS IN PROGRESS] Creating new session...');

      const session = setUpSession.session;
      session?.client.on('qr', async (qr) => {
        await generateQr(stream, qr);

        console.log(
          `[AUTH PROCESS IN PROGRESS] Session attempt created for ${user.uid}...`
        );

        this.#sessionsManager.modifySession(user.uid, {
          qr,
          client: session.client,
          startTime: getUnixTime(new Date()),
          endTime: getUnixTime(addMinutes(new Date(), 1))
        });

        resolve(stream);
      });

      session?.client.on('ready', async () => {
        console.log('[AUTH PROCESS DONE] Client is ready!');
      });

      session?.client.on('authenticated', async () => {
        await this.sessionsService.createSession(user.uid);
        console.log('[SESSION SAVED IN DB] Client is ready!');
      });
    });

    await QRreadStream;

    return QRreadStream;
  }

  @Security('fb-token')
  @Middlewares(checkSession)
  @Get('/get-chats')
  public async getChats(@Request() req: ExRequest) {
    const user = req!.body!.user;
    const session = this.#sessionsManager.get(user.uid);
    console.log('Session:', session);

    if (session) {
      const chats = await session.client.getChats();
      return chats.map((chat) => {
        return {
          id: chat.id._serialized,
          name: chat.name
        };
      });
    } else {
      throw new SessionNotFoundError(user.uid, {
        message: 'Session not found for user',
        statusCode: 401,
        name: 'SessionNotFound'
      });
    }
  }

  public async sendMessage(
    chatId: string,
    content: WAWebJS.MessageContent,
    options: WAWebJS.MessageSendOptions
  ) {
    const client = wppClientBuilder('session');
    return client.sendMessage(chatId, content, options);
  }
}

export { WppController };
