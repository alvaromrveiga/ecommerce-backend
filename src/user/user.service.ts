import { Injectable, UnauthorizedException } from '@nestjs/common';
import { hash, compare } from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

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

  async remove(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  private async hashIfUpdatingPassword(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<void> {
    if (updateUserDto.password && updateUserDto.currentPassword) {
      const user = await this.prisma.user.findUnique({ where: { id } });

      const isCorrectPassword = await compare(
        updateUserDto.currentPassword,
        user.password,
      );

      if (!isCorrectPassword) {
        throw new UnauthorizedException('Invalid current password');
      }

      const hashedPassword = await hash(updateUserDto.password, 10);

      updateUserDto.password = hashedPassword;
    }

    delete updateUserDto.currentPassword;
  }
}
