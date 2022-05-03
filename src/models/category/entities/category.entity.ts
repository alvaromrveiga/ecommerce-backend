import { Prisma } from '@prisma/client';

/** Describes the properties of a Category in the database */
export class Category implements Prisma.CategoryUncheckedCreateInput {
  /**
   * Category ID as UUID
   * @example "e6cf9a58-438c-4fce-8d85-db3d22db270a"
   */
  id?: string;

  /**
   * Category name
   * @example "Decoration"
   */
  name: string;
}
