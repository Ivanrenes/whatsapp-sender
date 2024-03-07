"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
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
exports.WppController = void 0;
const whatsapp_web_js_1 = require("whatsapp-web.js");
const qrcode_1 = __importDefault(require("qrcode"));
const tsoa_1 = require("tsoa");
const stream_1 = require("stream");
let WppController = class WppController {
    constructor(client) {
        this.client = client;
    }
    initializeWebQR() {
        return __awaiter(this, void 0, void 0, function* () {
            const QRreadStream = new Promise((resolve) => {
                const stream = new stream_1.PassThrough();
                this.client.on('qr', (qr) => __awaiter(this, void 0, void 0, function* () {
                    yield qrcode_1.default.toFileStream(stream, qr, {
                        type: 'png',
                        width: 200,
                        errorCorrectionLevel: 'H'
                    });
                    resolve(stream);
                }));
                this.client.on('ready', () => __awaiter(this, void 0, void 0, function* () {
                    console.log('Client is ready!');
                }));
            });
            this.client.initialize();
            return QRreadStream;
        });
    }
    // @Get('/create-session')
    // public async getSessions(): Promise<Readable> {}
    getChats() {
        return __awaiter(this, void 0, void 0, function* () {
            const chats = yield this.client.getChats();
            return chats.map((chat) => {
                return {
                    id: chat.id._serialized,
                    name: chat.name
                };
            });
        });
    }
    sendMessage(chatId, content, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.sendMessage(chatId, content, options);
        });
    }
};
exports.WppController = WppController;
__decorate([
    (0, tsoa_1.Get)('/auth'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WppController.prototype, "initializeWebQR", null);
__decorate([
    (0, tsoa_1.Get)('/get-chats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WppController.prototype, "getChats", null);
exports.WppController = WppController = __decorate([
    (0, tsoa_1.Route)('/wpp'),
    __metadata("design:paramtypes", [whatsapp_web_js_1.Client])
], WppController);
exports.default = WppController;
