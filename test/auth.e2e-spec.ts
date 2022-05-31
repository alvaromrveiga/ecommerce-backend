import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { isJWT } from 'class-validator';
import ms from 'ms';
import { AppModule } from 'src/app.module';
import { ExceptionInterceptor } from 'src/common/interceptors/exception.interceptor';
import { accessJwtConfig } from 'src/config/jwt.config';
import { PrismaService } from 'src/prisma/prisma.service';
import request from 'supertest';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

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
      expect(isJWT(response.body.accessToken)).toBeTruthy();

      const user = await prisma.user.findUnique({
        where: { email: 'tester0@example.com' },
      });

      const { sub, role, iat, exp } = jwtService.verify(
        response.body.accessToken,
        accessJwtConfig,
      );

      expect(sub).toEqual(user.id);
      expect(role).toEqual('USER');

      const expiresInSeconds = ms(accessJwtConfig.expiresIn as string) / 1000;

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

      const { role } = jwtService.verify(
        response.body.accessToken,
        accessJwtConfig,
      );

      expect(role).toEqual('ADMIN');
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
});
