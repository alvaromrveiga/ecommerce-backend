import { PickType } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Purchase } from '../entities/purchase.entity';

/** Describes the fields needed to review a Purchase */
export class ReviewPurchaseDto extends PickType(Purchase, [
  'reviewNote',
  'reviewComment',
]) {
  /** Product review note, from 1 to 5
   * @example 5
   */
  @IsInt()
  @Min(1)
  @Max(5)
  reviewNote: number;

  /** Product review comment
   * @example "Amazing wheelchair!"
   */
  @IsString()
  @IsOptional()
  reviewComment?: string;
}
