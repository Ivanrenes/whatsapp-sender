import WAWebJS, { Client } from 'whatsapp-web.js';
import QRCode from 'qrcode';
import { Controller, Get, Response, Route } from 'tsoa';
import { PassThrough, Readable } from 'stream';
import { wppClient } from '../wppClient';
import { addMinutes, getUnixTime } from 'date-fns';
import { Sessions } from '../sessions';

@Route('/wpp')
export default class WppController extends Controller {
  //create property client
  readonly #client: Client = wppClient;
  readonly #sessions = Sessions.getInstance();

  @Get('/auth')
  @Response('200', 'Success', 'sdsd')
  public async initializeWebQR() {
    const currentSession = this.#sessions.get('sessionUnique');

    if (
      currentSession !== undefined &&
      getUnixTime(new Date()) < currentSession.endTime
    ) {
      return currentSession.stream;
    }

    const QRreadStream: Promise<Readable> = new Promise((resolve) => {
      const stream = new PassThrough();

      this.#client.on('qr', async (qr) => {
        await QRCode.toFileStream(stream, qr, {
          type: 'png',
          width: 200,
          errorCorrectionLevel: 'H'
        });

        this.#sessions.set('sessionUnique', {
          stream,
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

    this.setHeader('Content-Type', 'image/png');

    return await QRreadStream;
  }

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
