import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { isDate, isUUID } from 'class-validator';
import { AppModule } from 'src/app.module';
import { ExceptionInterceptor } from 'src/common/interceptors/exception.interceptor';
import { CreateProductDto } from 'src/models/product/dto/create-product.dto';
import { CreatePurchaseDto } from 'src/models/purchase/dto/create-purchase.dto';
import { Purchase } from 'src/models/purchase/entities/purchase.entity';
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
        basePrice: 123.0,
      } as CreateProductDto);
    productsIds.push(response.body.id);

    response = await request(app.getHttpServer())
      .post('/product')
      .set({ Authorization: `Bearer ${adminToken}` })
      .send({
        name: 'Brand1 wood chair',
        basePrice: 70.0,
      } as CreateProductDto);
    productsIds.push(response.body.id);

    response = await request(app.getHttpServer())
      .post('/purchase')
      .set({ Authorization: `Bearer ${token}` })
      .send({
        productId: productsIds[0],
        totalPrice: 200,
        amount: 2,
      } as CreatePurchaseDto);
    purchasesIds.push(response.body.id);

    response = await request(app.getHttpServer())
      .post('/purchase')
      .set({ Authorization: `Bearer ${adminToken}` })
      .send({
        productId: productsIds[1],
        totalPrice: 350,
        amount: 4,
      } as CreatePurchaseDto);
    purchasesIds.push(response.body.id);

    response = await request(app.getHttpServer())
      .post('/purchase')
      .set({ Authorization: `Bearer ${token}` })
      .send({
        productId: productsIds[1],
        totalPrice: 250,
        amount: 3,
      } as CreatePurchaseDto);
    purchasesIds.push(response.body.id);

    response = await request(app.getHttpServer())
      .post('/purchase')
      .set({ Authorization: `Bearer ${adminToken}` })
      .send({
        productId: productsIds[0],
        totalPrice: 300,
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
          totalPrice: 50,
          amount: 1,
        } as CreatePurchaseDto)
        .expect(201);

      const purchase: Purchase = response.body;
      expect(purchase.productId).toEqual(productsIds[1]);
      expect(purchase.userId).toEqual(usersIds[0]);
      expect(purchase.totalPrice).toEqual('50');
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
          totalPrice: 50,
          amount: 1,
        })
        .expect(400);
    });

    it('should not create purchase if unauthenticated', async () => {
      await request(app.getHttpServer())
        .post('/purchase')
        .send({
          productId: productsIds[1],
          totalPrice: 50,
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
});
