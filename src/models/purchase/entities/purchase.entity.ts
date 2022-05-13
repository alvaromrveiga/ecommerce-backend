import { Prisma } from '@prisma/client';

/** Describes the properties of a Purchase in the database */
export class Purchase implements Prisma.PurchaseUncheckedCreateInput {
  /** Purchase ID as UUID
   * @example "b076f72e-f70b-4368-949e-1811c405c0f7"
   */
  id?: string;

  /** User ID as UUID
   * @example "a04bb2db-fecd-4889-979e-95f273eb70e1"
   */
  userId: string;

  /** Product ID as UUID
   * @example "5c68ae94-bf3e-4fde-b01f-25d18b3976a0"
   */
  productId: string;

  /** Amount purchased of the product
   * Defaults to 1
   * @example 2
   */
  amount?: number;

  /** Price payed per product multiplied by the amount
   * Saved as decimal, calculations should be handled
   * with currency.js
   * @example 138.75
   */
  totalPrice: string | number | Prisma.Decimal;

  /** Product review note, from 1 to 5
   * @example 5
   */
  reviewNote?: number;

  /** Product review comment
   * @example "Amazing wheelchair!"
   */
  reviewComment?: string;

  /** Purchase createdAt dateString
   * @example "2022-05-13T15:41:28.527Z"
   */
  createdAt?: string | Date;
}
