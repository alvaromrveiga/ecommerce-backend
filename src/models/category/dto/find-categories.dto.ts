import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

/** Describes the information to search for categories */
export class FindCategoriesDto {
  /** String containing in category name
   * @example "chair"
   */
  @IsOptional()
  @IsString()
  categoryName?: string;

  /** Show categories in this page
   * @example 1
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page?: number;

  /** Show this amount of categories per page
   * @example 10
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  offset?: number;
}
