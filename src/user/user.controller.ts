import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from 'src/auth/public.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserWithoutPassword } from './entities/user-without-password.entity';
import { UserService } from './user.service';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<void> {
    return this.userService.create(createUserDto);
  }

  @Get()
  async findById(@Req() request: Request): Promise<UserWithoutPassword> {
    const userId = request.user['userId'];

    return this.userService.findById(userId);
  }

  @Patch()
  update(
    @Req() request: Request,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserWithoutPassword> {
    const userId = request.user['userId'];

    return this.userService.update(userId, updateUserDto);
  }

  @ApiOperation({ summary: 'Deletes user' })
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Req() request: Request,
    @Body() deleteUserDto: DeleteUserDto,
  ): Promise<void> {
    const userId = request.user['userId'];

    return this.userService.remove(userId, deleteUserDto);
  }
}
