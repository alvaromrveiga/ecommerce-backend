import { OmitType } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime';
import {
  IsDecimal,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Product } from '../entities/product.entity';

/** Describes the fields needed to create a Product */
export class CreateProductDto extends OmitType(Product, [
  'id',
  'createdAt',
  'urlName',
] as const) {
  /**
   * Product name
   * @example "Brand black wheelchair"
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * Product picture
   * @example "image.jpg"
   */
  @IsString()
  @IsOptional()
  picture?: string;

  /**
   * Product price not considering discounts.
   * Saved as decimal and handled with currency.js
   * @example "70.00"
   */
  @IsDecimal()
  @IsNotEmpty()
  basePrice: string | number | Decimal;

  /**
   * Product discount in percentage. Defaults to 0
   * @example 10
   */
  @IsNumber()
  @IsOptional()
  discountPercentage?: number;

  /** Product stock amount. Defaults to 0
   * @example 42
   */
  @IsInt()
  @IsOptional()
  stock?: number;

  /**
   * Product description
   * @example "Black wheelchair for offices"
   */
  @IsString()
  @IsOptional()
  description?: string;
}
