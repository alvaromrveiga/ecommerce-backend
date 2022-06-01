import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { hashConfig } from 'src/config/hash.config';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserWithoutPassword } from './entities/user-without-password.entity';
import { User } from './entities/user.entity';
import { InvalidPasswordUpdateException } from './exceptions/invalid-password-update.exception';
import { MissingPasswordUpdateException } from './exceptions/missing-password-update.exception';

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
    const hashedPassword = await hash(
      createUserDto.password,
      hashConfig.saltRounds,
    );

    const lowerCaseEmail = createUserDto.email.toLowerCase();

    await this.prisma.user.create({
      data: {
        ...createUserDto,
        email: lowerCaseEmail,
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
    const lowerCaseEmail = email.toLowerCase();

    return this.prisma.user.findUnique({ where: { email: lowerCaseEmail } });
  }

  /** Updates user information */
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserWithoutPassword> {
    await this.hashIfUpdatingPassword(id, updateUserDto);

    const user = await this.prisma.user.update({
      where: { id },
      data: { ...updateUserDto, updatedAt: new Date() },
    });

    delete user.password;

    return { ...user };
  }

  /** Updates user role */
  async updateUserRole(
    updateUserRoleDto: UpdateUserRoleDto,
  ): Promise<UserWithoutPassword> {
    const user = await this.prisma.user.update({
      where: { email: updateUserRoleDto.email },
      data: { role: updateUserRoleDto.role },
    });

    delete user.password;

    return user;
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

      const hashedPassword = await hash(
        updateUserDto.password,
        hashConfig.saltRounds,
      );

      updateUserDto.password = hashedPassword;
      delete updateUserDto.currentPassword;

      return;
    }

    if (updateUserDto.password || updateUserDto.currentPassword) {
      throw new MissingPasswordUpdateException();
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
      throw new InvalidPasswordUpdateException();
    }
  }
}
