import { OmitType } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime';
import {
  IsArray,
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
  'picture',
] as const) {
  /**
   * Product name
   * @example "Brand black wheelchair"
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * Product price not considering discounts.
   * Saved as decimal, calculations should be handled
   * with currency.js
   * @example 70.00
   */
  @IsNumber()
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

  /**
   * Category IDs
   * @example ["857cd575-956b-49f3-a75e-2e651e21b871", "fa244865-0878-4688-ac63-e3ecf4939a89"]
   */
  @IsOptional()
  @IsArray()
  categories?: string[];
}
