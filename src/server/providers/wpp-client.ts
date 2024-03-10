import { Client, LocalAuth } from 'whatsapp-web.js';

const sessionFolderPath = process.env.SESSION_FOLDER_PATH || './sessions';

export const wppClientBuilder = (clientId: string) =>
  new Client({
    authStrategy: new LocalAuth({
      clientId,
      dataPath: sessionFolderPath
    }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage'
      ]
    },
    userAgent:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36'
  });
