"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const wpp_1 = __importDefault(require("../controllers/wpp"));
const wppClient_1 = require("../wppClient");
const router = express_1.default.Router();
router.get('/auth', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const wppController = new wpp_1.default(wppClient_1.client);
        const QR = yield wppController.initializeWebQR();
        res.header('Content-Type', 'image/png');
        QR.pipe(res);
    }
    catch (error) {
        res.status(500);
    }
}));
router.get('/get-sessions', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const wppController = new wpp_1.default(wppClient_1.client);
        const chats = yield wppController.getChats();
        res.send(chats);
    }
    catch (error) {
        res.status(500);
    }
}));
router.get('/:sessionId/get-chats', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const wppController = new wpp_1.default(wppClient_1.client);
        const chats = yield wppController.getChats();
        res.send(chats);
    }
    catch (error) {
        res.status(500);
    }
}));
router.get('/send-message', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatId, content, options } = req.body;
        const wppController = new wpp_1.default(wppClient_1.client);
        const message = yield wppController.sendMessage(chatId, content, options);
        res.status(200).send('Message sent');
    }
    catch (error) {
        res.status(500);
    }
}));
exports.default = router;
