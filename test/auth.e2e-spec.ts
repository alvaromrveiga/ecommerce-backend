import {
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
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
  let refreshToken: string;

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

    const response = await request(app.getHttpServer()).post('/login').send({
      email: 'tester1@example.com',
      password: 'abc123456',
    });

    refreshToken = response.body.refreshToken;

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
        .send({ refreshToken })
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
});
