import WAWebJS, { Client } from 'whatsapp-web.js';
import QRCode from 'qrcode';
import { Controller, Get, Response, Route } from 'tsoa';
import { PassThrough, Readable } from 'stream';
import { wppClient } from '../wppClient';

@Route('/wpp')
export default class WppController extends Controller {
  //create property client
  readonly #client: Client = wppClient;

  @Get('/auth')
  @Response('200', 'Success', 'sdsd')
  public async initializeWebQR() {
    this.#client.initialize();
    const QRreadStream: Promise<Readable> = new Promise((resolve) => {
      const stream = new PassThrough();
      this.#client.on('qr', async (qr) => {
        console.log('QR received!', qr);

        await QRCode.toFileStream(stream, qr, {
          type: 'png',
          width: 200,
          errorCorrectionLevel: 'H'
        });
        console.log('QR code generated!');
        resolve(stream);
      });

      this.#client.on('ready', async () => {
        console.log('Client is ready!');
      });
    });

    this.setHeader('Content-Type', 'image/png');

    this.#client.initialize();

    return QRreadStream;
  }

  // @Get('/create-session')
  // public async getSessions(): Promise<Readable> {}

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
