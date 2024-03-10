import QRCode from 'qrcode';
import { PassThrough } from 'stream';

export const generateQr = async (stream: PassThrough, qr: string) => {
  return await QRCode.toFileStream(stream, qr, {
    type: 'png',
    width: 200,
    errorCorrectionLevel: 'H'
  });
};
