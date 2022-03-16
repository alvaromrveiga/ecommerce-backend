import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserModule } from 'src/user/user.module';
import * as request from 'supertest';

describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UserModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();

    const prisma = app.get<PrismaService>(PrismaService);
    await prisma.user.deleteMany();
  });

  describe('Post /user', () => {
    it('should create user', () => {
      return request(app.getHttpServer())
        .post('/user')
        .send({
          email: 'tester@example.com',
          password: 'abc123456',
        })
        .expect(201);
    });

    it('should not create user if email is invalid', () => {
      return request(app.getHttpServer())
        .post('/user')
        .send({
          email: 'tester',
          password: 'abc123456',
        })
        .expect(400);
    });

    it('should not create user if password is too weak', () => {
      return request(app.getHttpServer())
        .post('/user')
        .send({
          email: 'tester@example.com',
          password: 'abc123',
        })
        .expect(400);
    });
  });
});
