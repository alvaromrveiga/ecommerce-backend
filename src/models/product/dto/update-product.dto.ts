import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

/** Describes the Product fields that are updatable
 *
 * <br>Note that since this is a
 * <u>Partial of <a href="CreateProductDto.html">CreateProductDto</a></u>,
 * any field there is optional here
 */
export class UpdateProductDto extends PartialType(CreateProductDto) {}
