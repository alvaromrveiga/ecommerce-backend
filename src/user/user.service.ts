import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InvalidPasswordUpdateError } from './errors/invalid-password-update.error';
import { MissingPasswordUpdateError } from './errors/missing-password-update.error';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<void> {
    const hashedPassword = await hash(createUserDto.password, 10);

    await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    return { ...user, password: undefined };
  }

  async findByEmail(email: string): Promise<User> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.hashIfUpdatingPassword(id, updateUserDto);

    const user = await this.prisma.user.update({
      where: { id },
      data: { ...updateUserDto },
    });

    return { ...user, password: undefined };
  }

  async remove(id: string, currentPassword: string): Promise<void> {
    await this.validateCurrentPassword(id, currentPassword);

    await this.prisma.user.delete({ where: { id } });
  }

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

  private async validateCurrentPassword(
    id: string,
    currentPassword: string,
  ): Promise<void> {
    if (!currentPassword) {
      throw new InvalidPasswordUpdateError();
    }

    const user = await this.prisma.user.findUnique({ where: { id } });

    const isCorrectPassword = await compare(currentPassword, user.password);

    if (!isCorrectPassword) {
      throw new InvalidPasswordUpdateError();
    }
  }
}
