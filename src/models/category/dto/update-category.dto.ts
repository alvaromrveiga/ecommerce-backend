import { PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';

/** Describes the Category fields that are updatable
 *
 * <br>Note that since this is a
 * <u>Partial of <a href="CreateCategoryDto.html">CreateCategoryDto</a></u>,
 * any field there is optional here
 */
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
