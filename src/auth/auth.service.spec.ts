import { Provider } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { accessJwtConfig, refreshJwtConfig } from 'src/config/jwt.config';
import { UserService } from 'src/models/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from './auth.service';
import { InvalidEmailOrPasswordError } from './errors/invalid-email-or-password.error.';

const userArray = [
  {
    id: 'b2f63bff-3b16-4cde-a777-c2c3b2b02945',
    email: 'tester@example.com',
    password: '$2b$10$1XpzUYu8FuvuaBb3SC0xzuR9DX7KakbMLt0vLNoZ.UnLntDMFc4LK', // abc123456
  },
  {
    id: '07b11faf-258b-4153-ae99-6d75bdcbcff5',
    email: 'tester2@example.com',
    password: '$2b$10$J/OgIXlICsf/8kdh1AD4AOK5DxlM/6YNkSnVdauduEvYP9KZdwlQa', // abc123456
  },
  {
    id: '07230400-8e26-4562-a085-8ffdf975651c',
    email: 'tester3@example.com',
    password: '$2b$10$TlT.I9C2CqqFlvE2PlF2lezaF3nQWRrZA34OBsj83WeqODysZtJ1a', // abc123456
  },
];

const userTokensArray = [];

const UserServiceMock = {
  provide: UserService,
  useValue: {
    findByEmail: jest.fn().mockImplementation((email) => {
      return userArray.find((user) => {
        return user.email === email;
      });
    }),
  },
};

const JwtServiceMock = {
  provide: JwtService,
  useValue: { signAsync: jest.fn().mockReturnValue('mockedValue') },
};

const PrismaServiceMock = {
  provide: PrismaService,
  useValue: {
    userTokens: {
      create: jest.fn().mockImplementation(({ data }) => {
        return userTokensArray.push(data);
      }),
      deleteMany: jest.fn().mockImplementation(({ where }) => {
        userTokensArray.filter((userToken) => {
          return userToken.userId !== where.userId;
        });
      }),
    },
  },
} as Provider;

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UserServiceMock,
        JwtServiceMock,
        PrismaServiceMock,
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
    expect(userService).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe('login', () => {
    it('should login user', async () => {
      const response = await authService.login(
        'tester2@example.com',
        'abc123456',
      );

      expect(userService.findByEmail).toHaveBeenCalledWith(
        'tester2@example.com',
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: '07b11faf-258b-4153-ae99-6d75bdcbcff5', role: undefined },
        { ...accessJwtConfig },
      );

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: '07b11faf-258b-4153-ae99-6d75bdcbcff5' },
        { ...refreshJwtConfig },
      );

      expect(response).toEqual({
        accessToken: 'mockedValue',
        refreshToken: 'mockedValue',
      });
    });

    it('should not login user if password is wrong', async () => {
      await expect(
        authService.login('tester2@example.com', 'wrongPassword'),
      ).rejects.toThrow(new InvalidEmailOrPasswordError());
    });

    it('should not login user if email does not exist', async () => {
      await expect(
        authService.login('unexistentTester@example.com', 'abc123456'),
      ).rejects.toThrow(new InvalidEmailOrPasswordError());
    });
  });
});
