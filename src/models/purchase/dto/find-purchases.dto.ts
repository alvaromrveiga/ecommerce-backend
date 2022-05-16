import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

/** Describes the information to search for purchases */
export class FindPurchasesDto {
  /** String matching user ID
   * @example "b0e0c99e-541c-463b-8fd6-306e52f9e686"
   */
  @IsOptional()
  @IsString()
  userId?: string;

  /** String matching product ID
   * @example "26c3fd79-f5bd-4646-a287-32d0226134e2"
   */
  @IsOptional()
  @IsString()
  productId?: string;

  /** Show purchases in this page
   * @example 1
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page?: number;

  /** Show this amount of purchases per page
   * @example 10
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  offset?: number;
}
