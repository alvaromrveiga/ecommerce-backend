import { IsNotEmpty, IsString } from 'class-validator';
import { Category } from '../entities/category.entity';

/** Describes the fields needed to create a Category */
export class CreateCategoryDto implements Category {
  /**
   * Category name
   * @example "Decoration"
   */
  @IsString()
  @IsNotEmpty()
  name: string;
}
