import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InvalidPasswordUpdateException } from './exceptions/invalid-password-update.exception';
import { MissingPasswordUpdateException } from './exceptions/missing-password-update.exception';
import { UserService } from './user.service';

let userArray: User[] = [];

const PrismaServiceMock = {
  provide: PrismaService,
  useValue: {
    user: {
      create: jest.fn().mockImplementation(({ data }) => {
        userArray.push({ ...data });
      }),
      findUnique: jest.fn().mockImplementation(({ where }) => {
        return userArray.find((user) => {
          return user.id === where.id || user.email === where.email;
        });
      }),
      update: jest.fn().mockImplementation(({ where, data }) => {
        const userIndex = userArray.findIndex((user) => {
          return user.id === where.id || user.email === where.email;
        });

        userArray[userIndex] = { ...userArray[userIndex], ...data };

        return userArray[userIndex];
      }),
      delete: jest.fn().mockImplementation(({ where }) => {
        const userIndex = userArray.findIndex((user) => {
          return user.id === where.id || user.email === where.email;
        });

        userArray.splice(userIndex, 1);
      }),
    },
  },
};

describe('UserService', () => {
  let userService: UserService;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, PrismaServiceMock],
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
    userArray[0].id = '6db1727e-0ccc-412d-8d1f-6f406bc7b373';

    await userService.create({
      email: 'tester2@example.com',
      password: 'abc123456',
    });
    userArray[1].id = '56a12d76-52e0-4ddd-8b7f-ffe88854d94c';

    await userService.create({
      email: 'tester3@example.com',
      password: 'abc123456',
    });
    userArray[2].id = '36d01635-687c-41f7-9ca1-548c55cdf5d9';

    jest.clearAllMocks();
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
      const user = await userService.findById(
        '56a12d76-52e0-4ddd-8b7f-ffe88854d94c',
      );

      expect(prismaService.user.findUnique).toHaveBeenCalled();

      expect(user.email).toEqual('tester2@example.com');
      expect(user).not.toHaveProperty('password');
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

      const user = await userService.update(
        '56a12d76-52e0-4ddd-8b7f-ffe88854d94c',
        data,
      );

      expect(prismaService.user.update).toHaveBeenCalled();

      expect(user.email).toEqual('tester2_new@example.com');
      expect(user.name).toEqual('Tester2');
      expect(user.address).toEqual('World Street 0 House 0');

      expect(user).not.toHaveProperty('password');
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
        userService.update('56a12d76-52e0-4ddd-8b7f-ffe88854d94c', data),
      ).rejects.toThrow(new InvalidPasswordUpdateException());
    });

    it('should not update if current password is empty', async () => {
      const data: UpdateUserDto = {
        password: 'abc12345678',
      };

      await expect(
        userService.update('56a12d76-52e0-4ddd-8b7f-ffe88854d94c', data),
      ).rejects.toThrow(new MissingPasswordUpdateException());
    });

    it('should not update if password is empty', async () => {
      const data: UpdateUserDto = {
        currentPassword: 'abc1234567',
      };

      await expect(
        userService.update('56a12d76-52e0-4ddd-8b7f-ffe88854d94c', data),
      ).rejects.toThrow(new MissingPasswordUpdateException());
    });
  });

  describe('update user role', () => {
    it('should update user role', async () => {
      let user = await userService.updateUserRole({
        email: 'tester2@example.com',
        role: 'ADMIN',
      });

      expect(user.role).toEqual('ADMIN');

      user = await userService.updateUserRole({
        email: 'tester2@example.com',
        role: 'USER',
      });

      expect(user.role).toEqual('USER');
      expect(user.email).toEqual('tester2@example.com');
      expect(user.id).toEqual('56a12d76-52e0-4ddd-8b7f-ffe88854d94c');
      expect(user).not.toHaveProperty('password');
    });
  });

  describe('delete', () => {
    it('should remove user', async () => {
      await userService.remove('56a12d76-52e0-4ddd-8b7f-ffe88854d94c', {
        currentPassword: 'abc123456',
      });

      expect(prismaService.user.delete).toHaveBeenCalled();

      expect(userArray.length).toEqual(2);

      const user = await prismaService.user.findUnique({
        where: { email: 'tester2@example.com' },
      });

      expect(user).toEqual(undefined);
    });

    it('should not remove user if password is wrong', async () => {
      await expect(
        userService.remove('56a12d76-52e0-4ddd-8b7f-ffe88854d94c', {
          currentPassword: 'wrongPassword',
        }),
      ).rejects.toThrow(new InvalidPasswordUpdateException());
    });

    it('should not remove user if password is empty', async () => {
      await expect(
        userService.remove('56a12d76-52e0-4ddd-8b7f-ffe88854d94c', {
          currentPassword: '',
        }),
      ).rejects.toThrow(new InvalidPasswordUpdateException());
    });
  });
});
