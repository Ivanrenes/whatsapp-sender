import WAWebJS, { Client } from 'whatsapp-web.js';
import QRCode from 'qrcode';
import { Get, Route } from 'tsoa';
import { PassThrough, Readable } from 'stream';

@Route('/wpp')
export default class WppController {
  //create property client
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  @Get('/auth')
  public async initializeWebQR(): Promise<Readable> {
    const QRreadStream: Promise<Readable> = new Promise((resolve) => {
      const stream = new PassThrough();
      this.client.on('qr', async (qr) => {
        await QRCode.toFileStream(stream, qr, {
          type: 'png',
          width: 200,
          errorCorrectionLevel: 'H'
        });
        resolve(stream);
      });

      this.client.on('ready', async () => {
        console.log('Client is ready!');
      });
    });

    this.client.initialize();

    return QRreadStream;
  }

  // @Get('/create-session')
  // public async getSessions(): Promise<Readable> {}

  @Get('/get-chats')
  public async getChats() {
    const chats = await this.client.getChats();
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
    return this.client.sendMessage(chatId, content, options);
  }
}

export { WppController };
