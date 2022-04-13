import { Prisma, Role } from '@prisma/client';

/** Describes the properties of an User in the database */
export class User implements Prisma.UserUncheckedCreateInput {
  /**
   * User ID as UUID
   * @example "d31fc56c-7aed-441e-9f7f-151be8d85634"
   */
  id?: string;

  /**
   * User's Role.
   * Can be "USER" or "ADMIN".
   * Admin users can handle products
   *
   * Defaults to "USER"
   * @example "USER"
   */
  role?: Role;

  /**
   * User email
   * @example "user@example.com"
   */
  email: string;

  /**
   * User password
   * @example "$2b$10$1XpzUYu8FuvuaBb3SC0xzuR9DX7KakbMLt0vLNoZ.UnLntDMFc4LK"
   */
  password: string;

  /**
   * User name
   * @example "John Doe"
   */
  name?: string;

  /**
   * User address
   * @example "World Street 0"
   */
  address?: string;

  /**
   * User createdAt dateString
   * @example "2022-03-26T15:41:28.527Z"
   */
  createdAt?: string | Date;

  /**
   * User updatedAt dateString
   * @example "2022-03-26T15:41:28.527Z"
   */
  updatedAt?: string | Date;
}
