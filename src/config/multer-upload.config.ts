import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import path from 'path';
import { FileTypeError } from 'src/models/product/exceptions/file-type.exception';

/** Configurations for the multer library used for file upload */
export const multerUploadConfig: MulterOptions = {
  storage: diskStorage({
    destination: './tmp',
    filename: (request, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const fileName = `${uniqueSuffix}-${file.originalname}`;

      return callback(null, fileName);
    },
  }),

  fileFilter: (request, file, callback) => {
    const imageTypes = /jpeg|jpg|png/;

    const mimetype = imageTypes.test(file.mimetype);
    const extname = imageTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );

    if (mimetype && extname) {
      return callback(null, true);
    }

    return callback(new FileTypeError(imageTypes), false);
  },

  limits: {
    fileSize: 3 * (1024 * 1024),
  },
};
