import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileUploadDto } from 'src/models/product/dto/file-upload.dto';

/** Add all file upload decorators at once
 *
 * <br>Example: Upload product picture
 */
export function FileUpload(): <TFunction>(
  target: object | TFunction,
  propertyKey?: string | symbol,
) => void {
  return applyDecorators(
    UseInterceptors(FileInterceptor('file')),
    ApiConsumes('multipart/form-data'),
    ApiBody({ type: FileUploadDto }),
  );
}
