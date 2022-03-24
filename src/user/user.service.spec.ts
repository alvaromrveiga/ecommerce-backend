import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InvalidPasswordUpdateError } from './errors/invalid-password-update.error';
import { MissingPasswordUpdateError } from './errors/missing-password-update.error';
import { UserService } from './user.service';

let userArray: User[] = [];

describe('UserService', () => {
  let userService: UserService;
  let prismaService: PrismaService;

  beforeAll(async () => {
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
                const userIndex = userArray.findIndex((user) => {
                  return user.email === where.id || user.email === where.email;
                });

                userArray[userIndex] = { ...userArray[userIndex], ...data };

                return userArray[userIndex];
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

  beforeEach(async () => {
    userArray = [];

    await userService.create({
      email: 'tester@example.com',
      password: 'abc123456',
    });

    await userService.create({
      email: 'tester2@example.com',
      password: 'abc123456',
    });

    await userService.create({
      email: 'tester3@example.com',
      password: 'abc123456',
    });
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe('createUser', () => {
    it('should createUser', async () => {
      await userService.create({
        email: 'tester4@example.com',
        password: 'abcd1234567',
      });

      expect(prismaService.user.create).toHaveBeenCalled();

      expect(userArray.length).toEqual(4);
      expect(userArray[3].email).toEqual('tester4@example.com');
      expect(userArray[3].password).not.toEqual('abcd1234567');
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
      const data: UpdateUserDto = {
        name: 'Tester2',
        address: 'World Street 0 House 0',
        email: 'tester2_new@example.com',
        currentPassword: 'abc123456',
        password: 'abc1234567',
      };

      const user = await userService.update('tester2@example.com', data);

      expect(prismaService.user.update).toHaveBeenCalled();

      expect(user.email).toEqual('tester2_new@example.com');
      expect(user.name).toEqual('Tester2');
      expect(user.address).toEqual('World Street 0 House 0');

      expect(user.password).toBeUndefined();
      expect(user).not.toHaveProperty('currentPassword');

      const userWithPassword = await userService.findByEmail(
        'tester2_new@example.com',
      );

      expect(userWithPassword.password).not.toEqual('abc123456');
      expect(userWithPassword.password).not.toEqual('abc1234567');
    });

    it('should not update if current password is invalid', async () => {
      const data: UpdateUserDto = {
        currentPassword: 'wrongPassword123',
        password: 'abc12345678',
      };

      await expect(
        userService.update('tester2@example.com', data),
      ).rejects.toThrow(new InvalidPasswordUpdateError());
    });

    it('should not update if current password is empty', async () => {
      const data: UpdateUserDto = {
        password: 'abc12345678',
      };

      await expect(
        userService.update('tester2@example.com', data),
      ).rejects.toThrow(new MissingPasswordUpdateError());
    });

    it('should not update if password is empty', async () => {
      const data: UpdateUserDto = {
        currentPassword: 'abc1234567',
      };

      await expect(
        userService.update('tester2@example.com', data),
      ).rejects.toThrow(new MissingPasswordUpdateError());
    });
  });

  describe('delete', () => {
    it('should remove user', async () => {
      await userService.remove('tester2@example.com', 'abc123456');

      expect(prismaService.user.delete).toHaveBeenCalled();

      expect(userArray.length).toEqual(2);

      const user = await prismaService.user.findUnique({
        where: { email: 'tester2@example.com' },
      });

      expect(user).toEqual(undefined);
    });

    it('should not remove user if password is wrong', async () => {
      await expect(
        userService.remove('tester2@example.com', 'wrongPassword'),
      ).rejects.toThrow(new InvalidPasswordUpdateError());
    });

    it('should not remove user if password is empty', async () => {
      await expect(
        userService.remove('tester2@example.com', ''),
      ).rejects.toThrow(new InvalidPasswordUpdateError());
    });
  });
});
