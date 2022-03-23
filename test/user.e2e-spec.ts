import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { isDateString, isUUID } from 'class-validator';
import { AppModule } from 'src/app.module';
import { EmailInUseError } from 'src/errors/email-in-use.error';
import { PrismaInterceptor } from 'src/interceptors/prisma.interceptor';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from 'src/user/entities/user.entity';
import * as request from 'supertest';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let prisma: PrismaService;

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

    app.useGlobalInterceptors(new PrismaInterceptor());

    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
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

    const response = await request(app.getHttpServer())
      .post('/login')
      .send({ email: 'tester0@example.com', password: 'abc123456' });

    token = response.body.accessToken;
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

    it('should not create user if email is already in use', () => {
      return expect(
        request(app.getHttpServer())
          .post('/user')
          .send({
            email: 'tester0@example.com',
            password: 'abc123456',
          })
          .expect(400),
      ).resolves.toMatchObject({
        text: JSON.stringify(new EmailInUseError().getResponse()),
      });
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

  describe('Get /user', () => {
    it('should get user profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/user')
        .set({ Authorization: `Bearer ${token}` })
        .send()
        .expect(200);

      const user: User = response.body;

      expect(user).not.toHaveProperty('password');

      expect(isUUID(user.id, 4)).toBeTruthy();
      expect(user.email).toEqual('tester0@example.com');
      expect(user.address).toBeNull();
      expect(user.name).toBeNull();
      expect(isDateString(user.createdAt)).toBeTruthy();
      expect(isDateString(user.updatedAt)).toBeTruthy();
    });

    it('should not get user profile if unauthenticated', () => {
      return request(app.getHttpServer()).get('/user').send().expect(401);
    });
  });

  describe('Patch /user', () => {
    it('should update user', async () => {
      const response = await request(app.getHttpServer())
        .patch('/user')
        .set({ Authorization: `Bearer ${token}` })
        .send({
          email: 'tester0_new_email@example.com',
          password: 'tester0new_password',
          currentPassword: 'abc123456',
          name: 'Tester 0',
          address: 'World Street 0 House 0',
        })
        .expect(200);

      const user: User = response.body;

      expect(user).not.toHaveProperty('password');

      expect(isUUID(user.id, 4)).toBeTruthy();
      expect(user.email).toEqual('tester0_new_email@example.com');
      expect(user.name).toEqual('Tester 0');
      expect(user.address).toEqual('World Street 0 House 0');
      expect(isDateString(user.createdAt)).toBeTruthy();
      expect(isDateString(user.updatedAt)).toBeTruthy();

      await request(app.getHttpServer())
        .post('/login')
        .send({
          email: 'tester0_new_email@example.com',
          password: 'tester0new_password',
        })
        .expect(200);
    });

    it('should not update if there is an invalid field', () => {
      return request(app.getHttpServer())
        .patch('/user')
        .set({ Authorization: `Bearer ${token}` })
        .send({
          id: '123',
          email: 'tester0_new_email@example.com',
        })
        .expect(400);
    });

    it('should not update password if currentPassword is wrong', () => {
      return request(app.getHttpServer())
        .patch('/user')
        .set({ Authorization: `Bearer ${token}` })
        .send({
          password: 'tester0new_password',
          currentPassword: 'wrongPassword',
          name: 'Tester 0',
        })
        .expect(400);
    });

    it('should not update password if currentPassword is empty', () => {
      return request(app.getHttpServer())
        .patch('/user')
        .set({ Authorization: `Bearer ${token}` })
        .send({
          password: 'tester0new_password',
          name: 'Tester 0',
        })
        .expect(400);
    });

    it('should not update if there is currentPassword without password', () => {
      return request(app.getHttpServer())
        .patch('/user')
        .set({ Authorization: `Bearer ${token}` })
        .send({
          currentPassword: 'abc123456',
          name: 'Tester 0',
        })
        .expect(400);
    });

    it('should not update password if new one is too weak', () => {
      return request(app.getHttpServer())
        .patch('/user')
        .set({ Authorization: `Bearer ${token}` })
        .send({
          password: '123456',
          currentPassword: 'abc123456',
          address: 'World Street 0 House 0',
        })
        .expect(400);
    });

    it('should not update if email is already in use', () => {
      return request(app.getHttpServer())
        .patch('/user')
        .set({ Authorization: `Bearer ${token}` })
        .send({
          email: 'tester1@example.com',
        })
        .expect(400);
    });
  });
});
