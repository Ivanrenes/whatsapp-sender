import WAWebJS, { Client } from 'whatsapp-web.js';
import { Controller, Get, Middlewares, Response, Route, Security } from 'tsoa';
import { PassThrough, Readable } from 'stream';
import { wppClient } from '../providers/wpp-client';
import { addMinutes, getUnixTime } from 'date-fns';
import { Sessions } from '../sessions';
import { generateQr } from '@/utils/qr';
import { checkSession } from '@/middlewares/check-session';

@Route('/wpp')
export default class WppController extends Controller {
  //create property client
  readonly #client: Client = wppClient;
  readonly #sessions = Sessions.getInstance();

  @Security('fb-token')
  @Get('/auth')
  @Response('200', 'Success', 'sdsd')
  public async initializeWebQR() {
    this.setHeader('Content-Type', 'image/png');

    const stream = new PassThrough();
    const currentSession = this.#sessions.get('sessionUnique');

    if (
      currentSession !== undefined &&
      getUnixTime(new Date()) < currentSession.endTime
    ) {
      console.log('Session is still valid');
      console.log('currentSession time', JSON.stringify(currentSession));

      await generateQr(stream, currentSession.qr);
      return stream as Readable;
    }

    const QRreadStream: Promise<Readable> = new Promise((resolve) => {
      console.log('Creating new session...');

      this.#client.on('qr', async (qr) => {
        await generateQr(stream, qr);

        this.#sessions.set('sessionUnique', {
          qr,
          startTime: getUnixTime(new Date()),
          endTime: getUnixTime(addMinutes(new Date(), 1))
        });

        resolve(stream);
      });

      this.#client.on('ready', async () => {
        console.log('Client is ready!');
      });

      if (this.#sessions.size() === 0) {
        this.#client.initialize();
      }
    });

    await QRreadStream;

    await this.#client.destroy();

    return QRreadStream;
  }

  @Security('fb-token')
  @Middlewares(checkSession)
  @Get('/get-chats')
  public async getChats() {
    const chats = await this.#client.getChats();
    return chats.map((chat) => {
      return {
        id: chat.id._serialized,
        name: chat.name
      };
    });
  }

  public async sendMessage(
    chatId: string,
    content: WAWebJS.MessageContent,
    options: WAWebJS.MessageSendOptions
  ) {
    return this.#client.sendMessage(chatId, content, options);
  }
}

export { WppController };
