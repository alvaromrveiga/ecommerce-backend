import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import path from 'path';
import { FileTypeError } from 'src/models/product/exceptions/file-type.exception';

/** Constant containing a Regular Expression
 * with the valid image upload types
 */
export const validImageUploadTypesRegex = /jpeg|jpg|png/;

/** Constant that sets the maximum image upload file size */
export const maxImageUploadSize = 3 * 1024 * 1024; // 3MB

/** Configurations for the multer library used for file upload.
 *
 * Accepts types jpeg, jpg and png of size up to 3MB
 */
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
    const mimetype = validImageUploadTypesRegex.test(file.mimetype);
    const extname = validImageUploadTypesRegex.test(
      path.extname(file.originalname).toLowerCase(),
    );

    if (mimetype && extname) {
      return callback(null, true);
    }

    return callback(new FileTypeError(validImageUploadTypesRegex), false);
  },

  limits: {
    fileSize: maxImageUploadSize,
  },
};
