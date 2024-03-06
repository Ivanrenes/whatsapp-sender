import { Client } from 'whatsapp-web.js'
import QRCode from 'qrcode'
import { PassThrough } from 'stream';
const client = new Client({});



const getQR = (): Promise<PassThrough> => new Promise(async (resolve, reject) => {

    const qrStream = new PassThrough();

    client.on('qr', async (qr) => {
        
        const result = await QRCode.toFileStream(qrStream, qr,
            {
                type: 'png',
                width: 200,
                errorCorrectionLevel: 'H'
            }
        );

        resolve(qrStream)

    });

    await client.initialize();
});

const getIsClientReady = ():  Promise<boolean> => new Promise((resolve, reject) => {
    
}) 

export  { getQR, getIsClientReady }