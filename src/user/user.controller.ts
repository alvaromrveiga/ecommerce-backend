import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { Public } from 'src/auth/public.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<void> {
    return this.userService.create(createUserDto);
  }

  @Get()
  async findById(@Req() request: Request): Promise<User> {
    const userId = request.user['userId'];

    return this.userService.findById(userId);
  }

  @Patch()
  update(
    @Req() request: Request,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const userId = request.user['userId'];

    return this.userService.update(userId, updateUserDto);
  }

  @Delete()
  remove(@Req() request: Request): Promise<void> {
    const userId = request.user['userId'];

    return this.userService.remove(userId);
  }
}
