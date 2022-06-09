import {
  INestApplication,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { isDate, isUUID } from 'class-validator';
import { AppModule } from 'src/app.module';
import { PurchaseNotFoundException } from 'src/common/exceptions/purchase/purchase-not-found.exception';
import { ExceptionInterceptor } from 'src/common/interceptors/exception.interceptor';
import { CreateProductDto } from 'src/models/product/dto/create-product.dto';
import { CreatePurchaseDto } from 'src/models/purchase/dto/create-purchase.dto';
import { ReviewPurchaseDto } from 'src/models/purchase/dto/review-purchase.dto';
import { UpdatePurchaseDto } from 'src/models/purchase/dto/update-purchase.dto';
import { Purchase } from 'src/models/purchase/entities/purchase.entity';
import { NotPurchaseOwnerException } from 'src/models/purchase/exceptions/not-purchase-owner.exception';
import { PrismaService } from 'src/prisma/prisma.service';
import request from 'supertest';

describe('CategoryController (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let adminToken: string;
  let prisma: PrismaService;
  let usersIds: string[];
  let productsIds: string[];
  let purchasesIds: string[];

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
    await prisma.purchase.deleteMany();
    await prisma.product.deleteMany();
    usersIds = [];
    productsIds = [];
    purchasesIds = [];

    await request(app.getHttpServer()).post('/user').send({
      email: 'tester@example.com',
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
      .send({ email: 'tester@example.com', password: 'abc123456' });
    token = response.body.accessToken;

    response = await request(app.getHttpServer())
      .get('/user')
      .set({ Authorization: `Bearer ${token}` })
      .send();
    usersIds.push(response.body.id);

    response = await request(app.getHttpServer())
      .post('/login')
      .send({ email: 'admin@example.com', password: 'abc123456' });
    adminToken = response.body.accessToken;

    response = await request(app.getHttpServer())
      .get('/user')
      .set({ Authorization: `Bearer ${adminToken}` })
      .send();
    usersIds.push(response.body.id);

    response = await request(app.getHttpServer())
      .post('/product')
      .set({ Authorization: `Bearer ${adminToken}` })
      .send({
        name: 'Brand2 wood table',
        basePrice: 123.99,
      } as CreateProductDto);
    productsIds.push(response.body.id);

    response = await request(app.getHttpServer())
      .post('/product')
      .set({ Authorization: `Bearer ${adminToken}` })
      .send({
        name: 'Brand1 wood chair',
        basePrice: 72.03,
      } as CreateProductDto);
    productsIds.push(response.body.id);

    response = await request(app.getHttpServer())
      .post('/purchase')
      .set({ Authorization: `Bearer ${token}` })
      .send({
        productId: productsIds[0],
        amount: 2,
      } as CreatePurchaseDto);
    purchasesIds.push(response.body.id);

    response = await request(app.getHttpServer())
      .post('/purchase')
      .set({ Authorization: `Bearer ${adminToken}` })
      .send({
        productId: productsIds[1],
        amount: 4,
      } as CreatePurchaseDto);
    purchasesIds.push(response.body.id);

    response = await request(app.getHttpServer())
      .post('/purchase')
      .set({ Authorization: `Bearer ${token}` })
      .send({
        productId: productsIds[1],
        amount: 3,
      } as CreatePurchaseDto);
    purchasesIds.push(response.body.id);

    response = await request(app.getHttpServer())
      .post('/purchase')
      .set({ Authorization: `Bearer ${adminToken}` })
      .send({
        productId: productsIds[0],
        amount: 8,
      } as CreatePurchaseDto);
    purchasesIds.push(response.body.id);
  });

  describe('Post /purchase', () => {
    it('should create purchase', async () => {
      const response = await request(app.getHttpServer())
        .post('/purchase')
        .set({ Authorization: `Bearer ${token}` })
        .send({
          productId: productsIds[1],
          amount: 1,
        } as CreatePurchaseDto)
        .expect(201);

      const purchase: Purchase = response.body;
      expect(purchase.productId).toEqual(productsIds[1]);
      expect(purchase.userId).toEqual(usersIds[0]);
      expect(purchase.totalPrice).toEqual('72.03');
      expect(purchase.amount).toEqual(1);
      expect(isUUID(purchase.id, 4)).toBeTruthy();
      expect(isDate(new Date(purchase.createdAt))).toBeTruthy();
      expect(purchase.reviewComment).toBeNull();
      expect(purchase.reviewNote).toBeNull();
    });

    it('should not create purchase with invalid fields', async () => {
      await request(app.getHttpServer())
        .post('/purchase')
        .set({ Authorization: `Bearer ${token}` })
        .send({
          id: '609128f4-e010-415b-a712-a1fbc9a73400',
          productId: productsIds[1],
          amount: 1,
        } as CreatePurchaseDto)
        .expect(400);
    });

    it('should not create purchase if unauthenticated', async () => {
      await request(app.getHttpServer())
        .post('/purchase')
        .send({
          productId: productsIds[1],
          amount: 1,
        } as CreatePurchaseDto)
        .expect(401);
    });
  });

  describe('Get /purchase/admin', () => {
    it('should findAll purchases with default pagination ordered by createdAt desc', async () => {
      const response = await request(app.getHttpServer())
        .get('/purchase/admin')
        .set({ Authorization: `Bearer ${adminToken}` })
        .send()
        .expect(200);

      const purchases: Purchase[] = response.body;

      expect(purchases.length).toEqual(4);
      expect(purchases[1].id).toEqual(purchasesIds[2]);
    });

    it('should findAll purchases with custom pagination ordered by createdAt desc', async () => {
      const response = await request(app.getHttpServer())
        .get('/purchase/admin?page=2&offset=2')
        .set({ Authorization: `Bearer ${adminToken}` })
        .send()
        .expect(200);

      const purchases: Purchase[] = response.body;

      expect(purchases.length).toEqual(2);
      expect(purchases[1].id).toEqual(purchasesIds[0]);
    });

    it('should findAll purchases searching by userId and productId', async () => {
      const response = await request(app.getHttpServer())
        .get(
          `/purchase/admin?userId=${usersIds[0]}&productId=${productsIds[1]}`,
        )
        .set({ Authorization: `Bearer ${adminToken}` })
        .send()
        .expect(200);

      const purchases: Purchase[] = response.body;

      expect(purchases.length).toEqual(1);
      expect(purchases[0].id).toEqual(purchasesIds[2]);
    });

    it('should not findAll purchases if not an admin', async () => {
      await request(app.getHttpServer())
        .get('/purchase/admin')
        .set({ Authorization: `Bearer ${token}` })
        .send()
        .expect(403);
    });

    it('should not findAll purchases if unauthenticated', async () => {
      await request(app.getHttpServer())
        .get('/purchase/admin')
        .send()
        .expect(401);
    });
  });

  describe('Get /purchase', () => {
    it('should findAll user purchases with default pagination ordered by createdAt desc', async () => {
      const response = await request(app.getHttpServer())
        .get('/purchase')
        .set({ Authorization: `Bearer ${token}` })
        .send()
        .expect(200);

      const purchases: Purchase[] = response.body;

      expect(purchases.length).toEqual(2);
      expect(purchases[0].id).toEqual(purchasesIds[2]);
      expect(purchases[0].userId).toEqual(usersIds[0]);
      expect(purchases[1].userId).toEqual(usersIds[0]);
    });

    it('should findAll user purchases with custom pagination ordered by createdAt desc', async () => {
      const response = await request(app.getHttpServer())
        .get('/purchase?page=2&offset=1')
        .set({ Authorization: `Bearer ${token}` })
        .send()
        .expect(200);

      const purchases: Purchase[] = response.body;

      expect(purchases.length).toEqual(1);
      expect(purchases[0].id).toEqual(purchasesIds[0]);
      expect(purchases[0].userId).toEqual(usersIds[0]);
    });

    it('should findAll user purchases searching by productId', async () => {
      const response = await request(app.getHttpServer())
        .get(`/purchase?productId=${productsIds[1]}`)
        .set({ Authorization: `Bearer ${token}` })
        .send()
        .expect(200);

      const purchases: Purchase[] = response.body;

      expect(purchases.length).toEqual(1);
      expect(purchases[0].id).toEqual(purchasesIds[2]);
      expect(purchases[0].userId).toEqual(usersIds[0]);
    });

    it('should not findAll user purchases if unauthenticated', async () => {
      await request(app.getHttpServer()).get('/purchase').send().expect(401);
    });
  });

  describe('Get /purchase/:id', () => {
    it('should get any purchase by id if admin', async () => {
      const response = await request(app.getHttpServer())
        .get(`/purchase/${purchasesIds[2]}`)
        .set({ Authorization: `Bearer ${adminToken}` })
        .send()
        .expect(200);

      const purchase: Purchase = response.body;

      expect(purchase.id).toEqual(purchasesIds[2]);
      expect(purchase.userId).toEqual(usersIds[0]);
      expect(purchase.productId).toEqual(productsIds[1]);
    });

    it('should get user own purchases if not admin', async () => {
      const response = await request(app.getHttpServer())
        .get(`/purchase/${purchasesIds[2]}`)
        .set({ Authorization: `Bearer ${token}` })
        .send()
        .expect(200);

      const purchase: Purchase = response.body;

      expect(purchase.id).toEqual(purchasesIds[2]);
      expect(purchase.userId).toEqual(usersIds[0]);
      expect(purchase.productId).toEqual(productsIds[1]);
    });

    it('should not get other users purchases if not admin', async () => {
      await expect(
        request(app.getHttpServer())
          .get(`/purchase/${purchasesIds[1]}`)
          .set({ Authorization: `Bearer ${token}` })
          .send()
          .expect(404),
      ).resolves.toMatchObject({
        text: JSON.stringify(
          new NotFoundException(
            new NotPurchaseOwnerException().message,
          ).getResponse(),
        ),
      });
    });

    it('should not get purchase if id is invalid', async () => {
      await expect(
        request(app.getHttpServer())
          .get('/purchase/invalidId')
          .set({ Authorization: `Bearer ${adminToken}` })
          .send()
          .expect(404),
      ).resolves.toMatchObject({
        text: JSON.stringify(new PurchaseNotFoundException().getResponse()),
      });
    });

    it('should not get purchase by id if unauthenticated', async () => {
      await request(app.getHttpServer())
        .get(`/purchase/${purchasesIds[2]}`)
        .send()
        .expect(401);
    });
  });

  describe('Patch /purchase/review/:id', () => {
    it('should review purchase', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/purchase/review/${purchasesIds[2]}`)
        .set({ Authorization: `Bearer ${token}` })
        .send({
          reviewNote: 5,
          reviewComment: 'Amazing product!',
        } as ReviewPurchaseDto)
        .expect(200);

      const purchase: Purchase = response.body;

      expect(purchase.reviewComment).toEqual('Amazing product!');
      expect(purchase.reviewNote).toEqual(5);

      expect(purchase.id).toEqual(purchasesIds[2]);
      expect(purchase.userId).toEqual(usersIds[0]);
      expect(purchase.productId).toEqual(productsIds[1]);
      expect(purchase.totalPrice).toEqual('216.09');
      expect(purchase.amount).toEqual(3);
    });

    it('should not review other users purchases', async () => {
      await expect(
        request(app.getHttpServer())
          .patch(`/purchase/review/${purchasesIds[2]}`)
          .set({ Authorization: `Bearer ${adminToken}` })
          .send({
            reviewNote: 1,
            reviewComment: 'Not the purchase owner',
          } as ReviewPurchaseDto)
          .expect(404),
      ).resolves.toMatchObject({
        text: JSON.stringify(
          new NotFoundException(
            new NotPurchaseOwnerException().message,
          ).getResponse(),
        ),
      });
    });

    it('should not review purchase with invalid field', async () => {
      await request(app.getHttpServer())
        .patch(`/purchase/review/${purchasesIds[2]}`)
        .set({ Authorization: `Bearer ${token}` })
        .send({
          userId: '2aff1e2a-faaf-4d58-9208-1db42e53cd57',
          reviewNote: 5,
          reviewComment: 'Amazing product!',
        })
        .expect(400);
    });

    it('should not review purchase if note if not between 1 and 5', async () => {
      await request(app.getHttpServer())
        .patch(`/purchase/review/${purchasesIds[2]}`)
        .set({ Authorization: `Bearer ${token}` })
        .send({
          reviewNote: 0,
          reviewComment: 'Amazing product!',
        })
        .expect(400);

      await request(app.getHttpServer())
        .patch(`/purchase/review/${purchasesIds[2]}`)
        .set({ Authorization: `Bearer ${token}` })
        .send({
          reviewNote: 6,
          reviewComment: 'Amazing product!',
        })
        .expect(400);
    });

    it('should not review purchase if id is invalid', async () => {
      await expect(
        request(app.getHttpServer())
          .patch('/purchase/review/invalidId')
          .set({ Authorization: `Bearer ${token}` })
          .send({
            reviewNote: 5,
            reviewComment: 'Amazing product!',
          } as ReviewPurchaseDto)
          .expect(404),
      ).resolves.toMatchObject({
        text: JSON.stringify(new PurchaseNotFoundException().getResponse()),
      });
    });

    it('should not review purchase if unauthenticated', async () => {
      await request(app.getHttpServer())
        .patch(`/purchase/review/${purchasesIds[2]}`)
        .send({
          reviewNote: 5,
          reviewComment: 'Amazing product!',
        } as ReviewPurchaseDto)
        .expect(401);
    });
  });

  describe('Patch /purchase/:id', () => {
    it('should update purchase', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/purchase/${purchasesIds[2]}`)
        .set({ Authorization: `Bearer ${adminToken}` })
        .send({
          productId: productsIds[0],
          amount: 4,
        } as UpdatePurchaseDto)
        .expect(200);

      const purchase: Purchase = response.body;

      expect(purchase.id).toEqual(purchasesIds[2]);
      expect(purchase.userId).toEqual(usersIds[0]);
      expect(purchase.productId).toEqual(productsIds[0]);
      expect(purchase.totalPrice).toEqual('495.96');
      expect(purchase.amount).toEqual(4);
      expect(purchase.reviewComment).toBeNull();
      expect(purchase.reviewNote).toBeNull();
    });

    it('should not update invalid field', async () => {
      await request(app.getHttpServer())
        .patch(`/purchase/${purchasesIds[2]}`)
        .set({ Authorization: `Bearer ${adminToken}` })
        .send({
          id: '4af7dbd4-bc93-4e37-b60f-67012b5d375b',
          productId: productsIds[0],
          amount: 4,
        })
        .expect(400);
    });

    it('should not update purchase if id is invalid', async () => {
      await expect(
        request(app.getHttpServer())
          .patch('/purchase/invalidId')
          .set({ Authorization: `Bearer ${adminToken}` })
          .send({
            productId: productsIds[0],
            amount: 4,
          } as UpdatePurchaseDto)
          .expect(404),
      ).resolves.toMatchObject({
        text: JSON.stringify(new PurchaseNotFoundException().getResponse()),
      });
    });

    it('should not update purchase id if user is not an admin', async () => {
      await request(app.getHttpServer())
        .patch(`/purchase/${purchasesIds[2]}`)
        .set({ Authorization: `Bearer ${token}` })
        .send({
          productId: productsIds[0],
          amount: 4,
        } as UpdatePurchaseDto)
        .expect(403);
    });

    it('should not update purchase id if unauthenticated', async () => {
      await request(app.getHttpServer())
        .patch(`/purchase/${purchasesIds[2]}`)
        .send({
          productId: productsIds[0],
          amount: 4,
        } as UpdatePurchaseDto)
        .expect(401);
    });
  });

  describe('Delete /purchase/:id', () => {
    it('should delete purchase', async () => {
      await request(app.getHttpServer())
        .delete(`/purchase/${purchasesIds[2]}`)
        .set({ Authorization: `Bearer ${adminToken}` })
        .send()
        .expect(204);

      const databasePurchase = await prisma.purchase.findUnique({
        where: { id: purchasesIds[2] },
      });

      expect(databasePurchase).toBeNull();
    });

    it('should not delete purchase if id is invalid', async () => {
      await expect(
        request(app.getHttpServer())
          .delete('/purchase/invalidId')
          .set({ Authorization: `Bearer ${adminToken}` })
          .send()
          .expect(404),
      ).resolves.toMatchObject({
        text: JSON.stringify(new PurchaseNotFoundException().getResponse()),
      });
    });

    it('should not delete purchase if user is not an admin', async () => {
      await request(app.getHttpServer())
        .delete(`/purchase/${purchasesIds[2]}`)
        .set({ Authorization: `Bearer ${token}` })
        .send()
        .expect(403);
    });

    it('should not delete purchase if unauthenticated', async () => {
      await request(app.getHttpServer())
        .delete(`/purchase/${purchasesIds[2]}`)
        .send()
        .expect(401);
    });
  });
});
