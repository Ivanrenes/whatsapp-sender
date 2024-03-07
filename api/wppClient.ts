import { Client, LocalAuth } from 'whatsapp-web.js';

export const wppClient = new Client({
  authStrategy: new LocalAuth({}),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});
