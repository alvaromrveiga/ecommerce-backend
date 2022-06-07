import {
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserTokens } from '@prisma/client';
import { isJWT, isUUID } from 'class-validator';
import ms from 'ms';
import { AppModule } from 'src/app.module';
import { InvalidRefreshTokenException } from 'src/auth/exceptions/invalid-refresh-token.exception';
import { ExceptionInterceptor } from 'src/common/interceptors/exception.interceptor';
import { accessJwtConfig, refreshJwtConfig } from 'src/config/jwt.config';
import { PrismaService } from 'src/prisma/prisma.service';
import request from 'supertest';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let accessTokens: string[];
  let refreshTokens: string[];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    app.useGlobalInterceptors(new ExceptionInterceptor());

    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    jwtService = app.get<JwtService>(JwtService);
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
    accessTokens = [];
    refreshTokens = [];

    await request(app.getHttpServer()).post('/user').send({
      email: 'tester0@example.com',
      password: 'abc123456',
    });

    await request(app.getHttpServer()).post('/user').send({
      email: 'tester1@example.com',
      password: 'abc123456',
    });

    await request(app.getHttpServer()).post('/user').send({
      email: 'admin@example.com',
      password: 'abc123456',
    });

    let response = await request(app.getHttpServer()).post('/login').send({
      email: 'tester0@example.com',
      password: 'abc123456',
    });

    accessTokens[0] = response.body.accessToken;
    refreshTokens[0] = response.body.refreshToken;

    response = await request(app.getHttpServer()).post('/login').send({
      email: 'tester1@example.com',
      password: 'abc123456',
    });

    accessTokens[1] = response.body.accessToken;
    refreshTokens[1] = response.body.refreshToken;

    await prisma.user.update({
      where: { email: 'admin@example.com' },
      data: { role: 'ADMIN' },
    });
  });

  describe('Post /login', () => {
    it('should login', async () => {
      const response = await request(app.getHttpServer())
        .post('/login')
        .send({
          email: 'tester0@example.com',
          password: 'abc123456',
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(isJWT(response.body.accessToken)).toBeTruthy();
      expect(isJWT(response.body.refreshToken)).toBeTruthy();

      const user = await prisma.user.findUnique({
        where: { email: 'tester0@example.com' },
      });

      let { sub, userRole, iat, exp } = await jwtService.verifyAsync(
        response.body.accessToken,
        accessJwtConfig,
      );

      expect(sub).toEqual(user.id);
      expect(userRole).toEqual('USER');

      let expiresInSeconds = ms(accessJwtConfig.expiresIn as string) / 1000;

      expect(exp).toEqual(iat + expiresInSeconds);

      ({ sub, userRole, iat, exp } = await jwtService.verifyAsync(
        response.body.refreshToken,
        refreshJwtConfig,
      ));

      expect(sub).toEqual(user.id);
      expect(userRole).toEqual('USER');

      expiresInSeconds = ms(refreshJwtConfig.expiresIn as string) / 1000;

      expect(exp).toEqual(iat + expiresInSeconds);

      const userTokens = await prisma.userTokens.findMany({
        where: { userId: user.id },
      });

      expect(userTokens.length).toEqual(2);
    });

    it('should login admin user', async () => {
      const response = await request(app.getHttpServer())
        .post('/login')
        .send({
          email: 'admin@example.com',
          password: 'abc123456',
        })
        .expect(200);

      let { userRole } = await jwtService.verifyAsync(
        response.body.accessToken,
        accessJwtConfig,
      );

      expect(userRole).toEqual('ADMIN');

      ({ userRole } = await jwtService.verifyAsync(
        response.body.refreshToken,
        refreshJwtConfig,
      ));

      expect(userRole).toEqual('ADMIN');
    });

    it('should login by case insensitive email', () => {
      return request(app.getHttpServer())
        .post('/login')
        .send({
          email: 'TeSteR0@exAmple.com',
          password: 'abc123456',
        })
        .expect(200);
    });

    it('should not login user if password is wrong', () => {
      return request(app.getHttpServer())
        .post('/login')
        .send({
          email: 'tester0@example.com',
          password: 'wrongPassword',
        })
        .expect(401);
    });

    it('should not login user if email does not exist', () => {
      return request(app.getHttpServer())
        .post('/login')
        .send({
          email: 'unexistentTester@example.com',
          password: 'abc123456',
        })
        .expect(401);
    });
  });

  describe('Post /refresh', () => {
    it('should refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/refresh')
        .send({ refreshToken: refreshTokens[1] })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(isJWT(response.body.accessToken)).toBeTruthy();
      expect(isJWT(response.body.refreshToken)).toBeTruthy();

      const user = await prisma.user.findUnique({
        where: { email: 'tester1@example.com' },
      });

      let { sub, userRole, tokenFamily } = await jwtService.verifyAsync(
        response.body.accessToken,
        accessJwtConfig,
      );

      expect(sub).toEqual(user.id);
      expect(userRole).toEqual('USER');
      expect(tokenFamily).toBeUndefined();

      ({ sub, userRole, tokenFamily } = await jwtService.verifyAsync(
        response.body.refreshToken,
        refreshJwtConfig,
      ));

      expect(sub).toEqual(user.id);
      expect(userRole).toEqual('USER');
      expect(isUUID(tokenFamily)).toBeTruthy();

      const userTokens = await prisma.userTokens.findMany({
        where: { userId: user.id },
      });

      expect(userTokens.length).toEqual(1);
    });

    it('should not refresh if token is not JWT', async () => {
      await request(app.getHttpServer())
        .post('/refresh')
        .send({ refreshToken: 'invalidRefreshToken' })
        .expect(400);
    });

    it('should not refresh if token signature is invalid', async () => {
      await request(app.getHttpServer())
        .post('/refresh')
        .send({
          refreshToken:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3O' +
            'DkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        })
        .expect(401);
    });

    it('should not refresh if token signature is valid but not in the database', async () => {
      const user = await prisma.user.findUnique({
        where: { email: 'tester1@example.com' },
      });

      const rotatedRefreshToken = await jwtService.signAsync(
        {
          sub: user.id,
          userRole: user.role,
          tokenFamily: '7d539903-a4cc-44d7-a156-96748e686d41',
        },
        refreshJwtConfig,
      );

      await expect(
        request(app.getHttpServer())
          .post('/refresh')
          .send({ refreshToken: rotatedRefreshToken })
          .expect(401),
      ).resolves.toMatchObject({
        text: JSON.stringify(
          new UnauthorizedException(
            new InvalidRefreshTokenException().message,
          ).getResponse(),
        ),
      });
    });
  });

  describe('Post /logout', () => {
    it('should logout', async () => {
      await request(app.getHttpServer())
        .post('/logout')
        .set({ Authorization: `Bearer ${accessTokens[1]}` })
        .send({ refreshToken: refreshTokens[1] })
        .expect(200);

      const userTokens = await prisma.userTokens.findMany({
        where: { refreshToken: refreshTokens[1] },
      });

      expect(userTokens.length).toEqual(0);
    });

    it('should not logout if refresh token is not jwt', async () => {
      await request(app.getHttpServer())
        .post('/logout')
        .set({ Authorization: `Bearer ${accessTokens[1]}` })
        .send({ refreshToken: 'invalidRefreshToken' })
        .expect(400);
    });

    it('should not logout if unauthenticated', async () => {
      await request(app.getHttpServer())
        .post('/logout')
        .send({ refreshToken: refreshTokens[1] })
        .expect(401);
    });
  });

  describe('Post /logoutAll', () => {
    it('should logout user from all devices', async () => {
      await request(app.getHttpServer())
        .post('/logoutAll')
        .set({ Authorization: `Bearer ${accessTokens[1]}` })
        .send()
        .expect(200);

      const user = await prisma.user.findUnique({
        where: { email: 'tester1@example.com' },
      });

      const userTokens = await prisma.userTokens.findMany({
        where: { userId: user.id },
      });

      expect(userTokens.length).toEqual(0);
    });

    it('should not logout user from all devices if unauthenticated', async () => {
      await request(app.getHttpServer()).post('/logoutAll').send().expect(401);
    });
  });

  describe('Get /tokens', () => {
    it('should show all user tokens', async () => {
      await request(app.getHttpServer())
        .post('/login')
        .send({
          email: 'tester1@example.com',
          password: 'abc123456',
        })
        .expect(200);

      const response = await request(app.getHttpServer())
        .get('/tokens')
        .set({ Authorization: `Bearer ${accessTokens[1]}` })
        .send()
        .expect(200);

      const userTokens: UserTokens[] = response.body;

      expect(userTokens.length).toEqual(2);

      const user = await prisma.user.findUnique({
        where: { email: 'tester1@example.com' },
      });

      expect(userTokens[0].userId).toEqual(user.id);
      expect(userTokens[1].userId).toEqual(user.id);
    });

    it('should not show all user tokens if unauthenticated', async () => {
      await request(app.getHttpServer()).get('/tokens').send().expect(401);
    });
  });
});
