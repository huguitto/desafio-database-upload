import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const tempFolder = path.resolve(__dirname, '..', '..', 'temp');
export default {
  directory: tempFolder, //isso aqui permite  agente enviar a tempfolder para  aaprte que elimina o avatar

  storage: multer.diskStorage({
    destination: tempFolder, //dirname é do meu pc até a pasta onde esta upload.ts(config)
    filename(request, file, callback) {
      const fileHash = crypto.randomBytes(10).toString('hex');
      const filename = `${fileHash}-${file.originalname}`;
      return callback(null, filename);
    },
  }),
};
