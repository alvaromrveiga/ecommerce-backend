import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserWithoutPassword } from './entities/user-without-password.entity';
import { User } from './entities/user.entity';
import { InvalidPasswordUpdateError } from './errors/invalid-password-update.error';
import { MissingPasswordUpdateError } from './errors/missing-password-update.error';

/** Responsible for managing users in the database.
 * CRUD endpoints are available for users.
 */
@Injectable()
export class UserService {
  /** Responsible for managing users in the database.
   * CRUD endpoints are available for users.
   *
   * Instantiate the class and the PrismaService dependency
   */
  constructor(private readonly prisma: PrismaService) {}

  /** Creates a new user */
  async create(createUserDto: CreateUserDto): Promise<void> {
    const hashedPassword = await hash(createUserDto.password, 10);

    await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });
  }

  /** Finds user by id and returns the user without password.
   * Used for default in app requests where the hashed password
   * won't be compared
   */
  async findById(id: string): Promise<UserWithoutPassword> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    delete user.password;

    return { ...user };
  }

  /** Finds user by email and returns the user with password.
   * Used mainly in login to compare if the inputted password matches
   * the hashed one.
   */
  async findByEmail(email: string): Promise<User> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  /** Updates user information */
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserWithoutPassword> {
    await this.hashIfUpdatingPassword(id, updateUserDto);

    const user = await this.prisma.user.update({
      where: { id },
      data: { ...updateUserDto },
    });

    delete user.password;

    return { ...user };
  }

  /** Removes user from database */
  async remove(id: string, deleteUserDto: DeleteUserDto): Promise<void> {
    await this.validateCurrentPassword(id, deleteUserDto.currentPassword);

    await this.prisma.user.delete({ where: { id } });
  }

  /** If the user inputted both new password and current password
   * the new password is hashed to be saved in the database replacing
   * the current one.
   *
   * If only the new password or current password were inputted the user
   * probably forgot about the other one and an error is thrown
   */
  private async hashIfUpdatingPassword(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<void> {
    if (updateUserDto.password && updateUserDto.currentPassword) {
      await this.validateCurrentPassword(id, updateUserDto.currentPassword);

      const hashedPassword = await hash(updateUserDto.password, 10);

      updateUserDto.password = hashedPassword;
      delete updateUserDto.currentPassword;

      return;
    }

    if (updateUserDto.password || updateUserDto.currentPassword) {
      throw new MissingPasswordUpdateError();
    }
  }

  /** Compares if the inputted current password matches the
   * user hashed password saved in the database
   *
   * If it doesn't, an error is thrown
   */
  private async validateCurrentPassword(
    id: string,
    currentPassword: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    const isCorrectPassword = await compare(currentPassword, user.password);

    if (!isCorrectPassword) {
      throw new InvalidPasswordUpdateError();
    }
  }
}
