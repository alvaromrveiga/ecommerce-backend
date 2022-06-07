import { Provider } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserTokens } from '@prisma/client';
import { isDate, isUUID } from 'class-validator';
import { accessJwtConfig, refreshJwtConfig } from 'src/config/jwt.config';
import { UserService } from 'src/models/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from './auth.service';
import { InvalidEmailOrPasswordException } from './exceptions/invalid-email-or-password.exception.';
import { InvalidRefreshTokenException } from './exceptions/invalid-refresh-token.exception';
import { RefreshTokenPayload } from './types/refresh-token-payload';

const userArray = [
  {
    id: 'b2f63bff-3b16-4cde-a777-c2c3b2b02945',
    email: 'tester@example.com',
    password: '$2b$10$1XpzUYu8FuvuaBb3SC0xzuR9DX7KakbMLt0vLNoZ.UnLntDMFc4LK', // abc123456
    role: 'USER',
  },
  {
    id: '07b11faf-258b-4153-ae99-6d75bdcbcff5',
    email: 'tester2@example.com',
    password: '$2b$10$J/OgIXlICsf/8kdh1AD4AOK5DxlM/6YNkSnVdauduEvYP9KZdwlQa', // abc123456
    role: 'USER',
  },
  {
    id: '07230400-8e26-4562-a085-8ffdf975651c',
    email: 'tester3@example.com',
    password: '$2b$10$TlT.I9C2CqqFlvE2PlF2lezaF3nQWRrZA34OBsj83WeqODysZtJ1a', // abc123456
    role: 'USER',
  },
];

let userTokensArray: UserTokens[] = [];

const UserServiceMock = {
  provide: UserService,
  useValue: {
    findByEmail: jest.fn().mockImplementation((email) => {
      return userArray.find((user) => {
        return user.email === email;
      });
    }),
    findById: jest.fn().mockImplementation((id) => {
      return userArray.find((user) => {
        return user.id === id;
      });
    }),
  },
};

const JwtServiceMock = {
  provide: JwtService,
  useValue: {
    signAsync: jest.fn().mockReturnValue('mockedValue'),
    verifyAsync: jest.fn().mockImplementation((refreshToken: string) => {
      const isRefreshTokenValid = userTokensArray.some((userToken) => {
        return userToken.refreshToken === refreshToken;
      });

      if (isRefreshTokenValid) {
        return {
          sub: userArray[1].id,
          tokenFamily: 'mockedTokenFamily',
        } as RefreshTokenPayload;
      }

      return false;
    }),
  },
};

const PrismaServiceMock = {
  provide: PrismaService,
  useValue: {
    userTokens: {
      create: jest.fn().mockImplementation(({ data }) => {
        userTokensArray.push(data);

        return data;
      }),
      findMany: jest.fn().mockImplementation(({ where }) => {
        return userTokensArray.filter((userTokens) => {
          return userTokens.userId === where.userId;
        });
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
  let refreshToken: string;

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

  beforeEach(async () => {
    userTokensArray = [];

    const response = await authService.login(
      'tester2@example.com',
      'abc123456',
      '127.0.0.1 Tester browser',
    );

    refreshToken = response.refreshToken;

    jest.clearAllMocks();
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
        { sub: '07b11faf-258b-4153-ae99-6d75bdcbcff5', userRole: 'USER' },
        { ...accessJwtConfig },
      );

      const uuidv4Regex = new RegExp(
        /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
      );

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        {
          sub: '07b11faf-258b-4153-ae99-6d75bdcbcff5',
          userRole: undefined,
          tokenFamily: expect.stringMatching(uuidv4Regex),
        } as RefreshTokenPayload,
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
      ).rejects.toThrow(new InvalidEmailOrPasswordException());
    });

    it('should not login user if email does not exist', async () => {
      await expect(
        authService.login('unexistentTester@example.com', 'abc123456'),
      ).rejects.toThrow(new InvalidEmailOrPasswordException());
    });
  });

  describe('refreshToken', () => {
    it('should refresh token', async () => {
      const response = await authService.refreshToken(
        refreshToken,
        '127.0.0.1 Tester browser',
      );

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(
        refreshToken,
        refreshJwtConfig,
      );

      expect(prismaService.userTokens.findMany).toHaveBeenCalledWith({
        where: { userId: userArray[1].id, refreshToken },
      });

      expect(userService.findById).toHaveBeenCalledWith(userArray[1].id);

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: userArray[1].id, userRole: 'USER' },
        accessJwtConfig,
      );

      expect(prismaService.userTokens.deleteMany).toHaveBeenCalledWith({
        where: { refreshToken },
      });

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: userArray[1].id, tokenFamily: 'mockedTokenFamily' },
        refreshJwtConfig,
      );

      expect(prismaService.userTokens.create).toHaveBeenCalledWith({
        data: {
          userId: userArray[1].id,
          refreshToken,
          family: 'mockedTokenFamily',
          browserInfo: '127.0.0.1 Tester browser',
          expiresAt: expect.any(Date),
        },
      });

      expect(response).toEqual({
        accessToken: 'mockedValue',
        refreshToken: 'mockedValue',
      });
    });

    it('should not refresh token if token is invalid', async () => {
      await expect(
        authService.refreshToken(
          'invalidRefreshToken',
          '127.0.0.1 Tester browser',
        ),
      ).rejects.toThrow(new InvalidRefreshTokenException());
    });
  });

  describe('logout', () => {
    it('should logout', async () => {
      await authService.logout(refreshToken);

      expect(prismaService.userTokens.deleteMany).toHaveBeenCalledWith({
        where: { refreshToken },
      });
    });
  });

  describe('logoutAll', () => {
    it('should logout user from all sessions', async () => {
      await authService.logoutAll(userArray[1].id);

      expect(prismaService.userTokens.deleteMany).toHaveBeenCalledWith({
        where: { userId: userArray[1].id },
      });
    });
  });

  describe('findAllTokens', () => {
    it('should find all user active tokens', async () => {
      const tokens = await authService.findAllTokens(userArray[1].id);

      expect(tokens.length).toEqual(1);
      expect(tokens[0].userId).toEqual(userArray[1].id);
      expect(tokens[0].refreshToken).toEqual(refreshToken);
      expect(isUUID(tokens[0].family)).toBeTruthy();
      expect(tokens[0].browserInfo).toEqual('127.0.0.1 Tester browser');
      expect(isDate(tokens[0].expiresAt)).toBeTruthy();
    });
  });
});
