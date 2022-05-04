import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

/** Describes the information to search for products */
export class FindProductsDto {
  /** String containing in product name
   * @example "chair"
   */
  @IsOptional()
  @IsString()
  productName?: string;

  /** Show products in this page
   * @example 1
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page?: number;

  /** Show this amount of products per page
   * @example 10
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  offset?: number;
}
