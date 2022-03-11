import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

const userArray: User[] = [];

describe('UserService', () => {
  let userService: UserService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn().mockImplementation(({ data }) => {
                userArray.push({ ...data });
              }),
              findUnique: jest.fn().mockImplementation(({ where }) => {
                return userArray.find((user) => {
                  return user.email === where.id || user.email === where.email;
                });
              }),
              update: jest.fn().mockImplementation(({ where, data }) => {
                let user = userArray.find((user) => {
                  return user.email === where.id || user.email === where.email;
                });

                user = { ...user, ...data };

                return user;
              }),
              delete: jest.fn().mockImplementation(({ where }) => {
                const userIndex = userArray.findIndex((user) => {
                  return user.email === where.id || user.email === where.email;
                });

                userArray.splice(userIndex, 1);
              }),
            },
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe('createUser', () => {
    it('should createUser', async () => {
      const data: CreateUserDto = {
        email: 'tester@example.com',
        password: 'abc123456',
      };

      await userService.create(data);

      const data2: CreateUserDto = {
        email: 'tester2@example.com',
        password: 'abc123456',
      };

      await userService.create(data2);

      const data3: CreateUserDto = {
        email: 'tester3@example.com',
        password: 'abc123456',
      };

      await userService.create(data3);

      expect(prismaService.user.create).toHaveBeenCalled();

      expect(userArray.length).toEqual(3);
      expect(userArray[0].email).toEqual('tester@example.com');
      expect(userArray[0].password).not.toEqual('abc123456');
    });
  });

  describe('findById', () => {
    it('should return user without password', async () => {
      const user = await userService.findById('tester2@example.com');

      expect(prismaService.user.findUnique).toHaveBeenCalled();

      expect(user.email).toEqual('tester2@example.com');
      expect(user.password).toEqual(undefined);
    });
  });

  describe('findByEmail', () => {
    it('should return user', async () => {
      const user = await userService.findByEmail('tester2@example.com');

      expect(prismaService.user.findUnique).toHaveBeenCalled();

      expect(user.email).toEqual('tester2@example.com');
      expect(user.password).not.toEqual('abc123456');
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      const data: UpdateUserDto = { name: 'Tester2' };

      const user = await userService.update('tester2@example.com', data);

      expect(prismaService.user.update).toHaveBeenCalled();

      expect(user.email).toEqual('tester2@example.com');
      expect(user.password).not.toEqual('abc123456');
      expect(user.name).toEqual('Tester2');
    });
  });

  describe('delete', () => {
    it('should remove user', async () => {
      await userService.remove('tester2@example.com');

      expect(prismaService.user.delete).toHaveBeenCalled();

      expect(userArray.length).toEqual(2);

      const user = await prismaService.user.findUnique({
        where: { email: 'tester2@example.com' },
      });

      expect(user).toEqual(undefined);
    });
  });
});
