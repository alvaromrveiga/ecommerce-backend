import { Prisma } from '@prisma/client';

/** Describes the properties of a Product in the database */
export class Product implements Prisma.ProductUncheckedCreateInput {
  /**
   * Product ID as UUID
   * @example "6f4ca8a4-8aa0-4302-ac1b-7b5547f01b0a"
   */
  id?: string;

  /**
   * Product name
   * @example "Brand black wheelchair"
   */
  name: string;

  /**
   * Product name turned to url
   * @example "brand-black-wheelchair"
   */
  urlName: string;

  /**
   * Product picture
   * @example "image.jpg"
   */
  picture?: string;

  /**
   * Product price not considering discounts.
   * Saved as decimal, calculations should be handled
   * with currency.js
   * @example 70.00
   */
  basePrice: string | number | Prisma.Decimal;

  /**
   * Product discount in percentage. Defaults to 0
   * @example 10
   */
  discountPercentage?: number;

  /** Product stock amount. Defaults to 0
   * @example 42
   */
  stock?: number;

  /**
   * Product description
   * @example "Black wheelchair for offices"
   */
  description?: string;

  /**
   * Product createdAt dateString
   * @example "2022-03-26T15:41:28.527Z"
   */
  createdAt?: string | Date;
}
