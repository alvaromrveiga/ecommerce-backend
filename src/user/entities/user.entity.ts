import { Prisma } from '@prisma/client';

export class User implements Prisma.UserUncheckedCreateInput {
  id?: string;
  email: string;
  password: string;
  name?: string;
  address?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
