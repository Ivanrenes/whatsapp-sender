import express from 'express';
import WppController from '../controllers/wpp';
import { client } from '../wppClient';

const router = express.Router();

router.get('/auth', async (req, res) => {
  try {
    const wppController = new WppController(client);
    const QR = await wppController.initializeWebQR();

    res.header('Content-Type', 'image/png');

    QR.pipe(res);
  } catch (error) {
    res.status(500);
  }
});
router.get('/get-sessions', async (req, res) => {
  try {
    const wppController = new WppController(client);
    const chats = await wppController.getChats();
    res.send(chats);
  } catch (error) {
    res.status(500);
  }
});

router.get('/:sessionId/get-chats', async (req, res) => {
  try {
    const wppController = new WppController(client);
    const chats = await wppController.getChats();
    res.send(chats);
  } catch (error) {
    res.status(500);
  }
});

router.get('/send-message', async (req, res) => {
  try {
    const { chatId, content, options } = req.body;
    const wppController = new WppController(client);
    const message = await wppController.sendMessage(chatId, content, options);
    res.status(200).send('Message sent');
  } catch (error) {
    res.status(500);
  }
});

export default router;
