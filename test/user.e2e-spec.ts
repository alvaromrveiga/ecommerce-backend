import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { isDate, isDateString, isUUID } from 'class-validator';
import { AppModule } from 'src/app.module';
import { EmailInUseException } from 'src/common/exceptions/user/email-in-use.exception';
import { UserNotFoundException } from 'src/common/exceptions/user/user-not-found.exception';
import { ExceptionInterceptor } from 'src/common/interceptors/exception.interceptor';
import { UpdateUserDto } from 'src/models/user/dto/update-user.dto';
import { User } from 'src/models/user/entities/user.entity';
import { MissingPasswordUpdateException } from 'src/models/user/exceptions/missing-password-update.exception';
import { PrismaService } from 'src/prisma/prisma.service';
import request from 'supertest';
import { InvalidPasswordUpdateException } from '../src/models/user/exceptions/invalid-password-update.exception';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let adminToken: string;
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

    app.useGlobalInterceptors(new ExceptionInterceptor());

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

    await request(app.getHttpServer()).post('/user').send({
      email: 'admin@example.com',
      password: 'abc123456',
    });

    await prisma.user.update({
      where: { email: 'admin@example.com' },
      data: { role: 'ADMIN' },
    });

    let response = await request(app.getHttpServer())
      .post('/login')
      .send({ email: 'tester0@example.com', password: 'abc123456' });

    token = response.body.accessToken;

    response = await request(app.getHttpServer())
      .post('/login')
      .send({ email: 'admin@example.com', password: 'abc123456' });

    adminToken = response.body.accessToken;
  });

  describe('Post /user', () => {
    it('should create user', async () => {
      await request(app.getHttpServer())
        .post('/user')
        .send({
          email: 'tester@example.com',
          password: 'abc123456',
        })
        .expect(201);

      const user = await prisma.user.findUnique({
        where: { email: 'tester@example.com' },
      });

      expect(user).toBeDefined();

      expect(isUUID(user.id, 4)).toBeTruthy();
      expect(user.email).toEqual('tester@example.com');
      expect(user.password).not.toEqual('abc123456');
      expect(user.address).toBeNull();
      expect(user.name).toBeNull();
      expect(isDate(user.createdAt)).toBeTruthy();
      expect(isDate(user.updatedAt)).toBeTruthy();
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
        text: JSON.stringify(new EmailInUseException().getResponse()),
      });
    });

    it('should not create user if email is already in use by case insensitive', () => {
      return expect(
        request(app.getHttpServer())
          .post('/user')
          .send({
            email: 'tEsTer0@example.com',
            password: 'abc123456',
          })
          .expect(400),
      ).resolves.toMatchObject({
        text: JSON.stringify(new EmailInUseException().getResponse()),
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

      expect(new Date(user.updatedAt).getTime()).toBeGreaterThan(
        new Date(user.createdAt).getTime(),
      );

      await request(app.getHttpServer())
        .post('/login')
        .send({
          email: 'tester0_new_email@example.com',
          password: 'tester0new_password',
        })
        .expect(200);
    });

    it('should not update if unauthenticated', () => {
      return request(app.getHttpServer())
        .patch('/user')
        .send({
          email: 'tester0_new_email@example.com',
          name: 'Tester 0',
        })
        .expect(401);
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

    it('should not update password if currentPassword is wrong', async () => {
      await expect(
        request(app.getHttpServer())
          .patch('/user')
          .set({ Authorization: `Bearer ${token}` })
          .send({
            password: 'tester0new_password',
            currentPassword: 'wrongPassword',
            name: 'Tester 0',
            email: 'tester0_newEmail@example.com',
          } as UpdateUserDto)
          .expect(400),
      ).resolves.toMatchObject({
        text: JSON.stringify(
          new BadRequestException(
            new InvalidPasswordUpdateException().message,
          ).getResponse(),
        ),
      });
    });

    it('should not update there is password without currentPassword', async () => {
      await expect(
        request(app.getHttpServer())
          .patch('/user')
          .set({ Authorization: `Bearer ${token}` })
          .send({
            password: 'tester0new_password',
            name: 'Tester 0',
          })
          .expect(400),
      ).resolves.toMatchObject({
        text: JSON.stringify(
          new BadRequestException(
            new MissingPasswordUpdateException().message,
          ).getResponse(),
        ),
      });
    });

    it('should not update if there is currentPassword without password', async () => {
      await expect(
        request(app.getHttpServer())
          .patch('/user')
          .set({ Authorization: `Bearer ${token}` })
          .send({
            currentPassword: 'abc123456',
            name: 'Tester 0',
          } as UpdateUserDto)
          .expect(400),
      ).resolves.toMatchObject({
        text: JSON.stringify(
          new BadRequestException(
            new MissingPasswordUpdateException().message,
          ).getResponse(),
        ),
      });
    });

    it('should not update password if new one is too weak', () => {
      return request(app.getHttpServer())
        .patch('/user')
        .set({ Authorization: `Bearer ${token}` })
        .send({
          password: '123456',
          currentPassword: 'abc123456',
          address: 'World Street 0 House 0',
          email: 'tester0_newEmail@example.com',
        })
        .expect(400);
    });

    it('should not update if email is already in use', async () => {
      await expect(
        request(app.getHttpServer())
          .patch('/user')
          .set({ Authorization: `Bearer ${token}` })
          .send({
            email: 'tester1@example.com',
            password: 'abcd1234567',
            currentPassword: 'abc123456',
          } as UpdateUserDto)
          .expect(400),
      ).resolves.toMatchObject({
        text: JSON.stringify(new EmailInUseException().getResponse()),
      });
    });
  });

  describe('Patch /user/role', () => {
    it('should update user role', async () => {
      const user = await prisma.user.findUnique({
        where: { email: 'tester1@example.com' },
      });

      expect(user.role).toEqual('USER');

      const { body: userResponse } = await request(app.getHttpServer())
        .patch('/user/role')
        .set({ Authorization: `Bearer ${adminToken}` })
        .send({ email: 'tester1@example.com', role: 'ADMIN' })
        .expect(200);

      expect(userResponse.role).toEqual('ADMIN');
      expect(userResponse).not.toHaveProperty('password');
    });

    it('should not update user role if logged user is not admin', async () => {
      await request(app.getHttpServer())
        .patch('/user/role')
        .set({ Authorization: `Bearer ${token}` })
        .send({ email: 'tester1@example.com', role: 'ADMIN' })
        .expect(403);
    });

    it('should not update user role if unauthenticated', async () => {
      await request(app.getHttpServer())
        .patch('/user/role')
        .send({ email: 'tester1@example.com', role: 'ADMIN' })
        .expect(401);
    });

    it('should not update user role if role is invalid', async () => {
      await request(app.getHttpServer())
        .patch('/user/role')
        .set({ Authorization: `Bearer ${adminToken}` })
        .send({ email: 'tester1@example.com', role: 'INVALID_ROLE' })
        .expect(400);
    });

    it('should not update user role if user is invalid', async () => {
      await expect(
        request(app.getHttpServer())
          .patch('/user/role')
          .set({ Authorization: `Bearer ${adminToken}` })
          .send({ email: 'MisspelledUser@example.co', role: 'ADMIN' })
          .expect(404),
      ).resolves.toMatchObject({
        text: JSON.stringify(new UserNotFoundException().getResponse()),
      });
    });
  });

  describe('Delete /user', () => {
    it('should delete user', async () => {
      await request(app.getHttpServer())
        .delete('/user')
        .set({ Authorization: `Bearer ${token}` })
        .send({ currentPassword: 'abc123456' })
        .expect(204);

      const user = await prisma.user.findUnique({
        where: { email: 'tester0@example.com' },
      });

      expect(user).toBeNull();
    });

    it('should not delete user if unauthenticated', () => {
      return request(app.getHttpServer())
        .delete('/user')
        .send({ currentPassword: 'abc123456' })
        .expect(401);
    });

    it('should not delete user if currentPassword is wrong', () => {
      return request(app.getHttpServer())
        .delete('/user')
        .set({ Authorization: `Bearer ${token}` })
        .send({ currentPassword: 'wrongPassword' })
        .expect(400);
    });

    it('should not delete user if currentPassword is empty', () => {
      return request(app.getHttpServer())
        .delete('/user')
        .set({ Authorization: `Bearer ${token}` })
        .expect(400);
    });
  });
});
