import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { isDate, isUUID } from 'class-validator';
import { AppModule } from 'src/app.module';
import { PrismaInterceptor } from 'src/common/interceptors/prisma.interceptor';
import { CreateProductDto } from 'src/models/product/dto/create-product.dto';
import { Product } from 'src/models/product/entities/product.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import request from 'supertest';

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

    app.useGlobalInterceptors(new PrismaInterceptor());

    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
    await prisma.product.deleteMany();

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
      .post('/login')
      .send({ email: 'admin@example.com', password: 'abc123456' });

    adminToken = response.body.accessToken;

    await request(app.getHttpServer())
      .post('/product')
      .set({ Authorization: `Bearer ${adminToken}` })
      .send({
        name: 'Brand1 wood table',
        basePrice: 120.0,
      } as CreateProductDto);

    await request(app.getHttpServer())
      .post('/product')
      .set({ Authorization: `Bearer ${adminToken}` })
      .send({
        name: 'Brand2 wood table',
        picture: 'tablePicture.jpg',
        basePrice: 123.0,
        discountPercentage: 8,
        stock: 20,
        description: 'Brand2 wood table for offices',
      } as CreateProductDto);

    await request(app.getHttpServer())
      .post('/product')
      .set({ Authorization: `Bearer ${adminToken}` })
      .send({
        name: 'Brand3 wood table',
        basePrice: 150.0,
      } as CreateProductDto);

    await request(app.getHttpServer())
      .post('/product')
      .set({ Authorization: `Bearer ${adminToken}` })
      .send({
        name: 'Brand4 wood table',
        basePrice: 200.0,
      } as CreateProductDto);
  });

  describe('Post /product', () => {
    it('should create product', async () => {
      const response = await request(app.getHttpServer())
        .post('/product')
        .set({ Authorization: `Bearer ${adminToken}` })
        .send({
          name: 'Brand1 wheelchair',
          picture: 'picture.jpg',
          basePrice: 199.99,
          discountPercentage: 10,
          stock: 16,
          description: 'Brand1 wheelchair for offices',
        } as CreateProductDto)
        .expect(201);

      const databaseProduct = await prisma.product.findUnique({
        where: { name: 'Brand1 wheelchair' },
      });
      const product = response.body as Product;

      expect(databaseProduct).toBeDefined();

      expect(isUUID(product.id, 4)).toBeTruthy();
      expect(product.name).toEqual('Brand1 wheelchair');
      expect(product.urlName).toEqual('brand1-wheelchair');
      expect(product.picture).toEqual('picture.jpg');
      expect(product.basePrice).toEqual('199.99');
      expect(product.discountPercentage).toEqual(10);
      expect(product.stock).toEqual(16);
      expect(product.description).toEqual('Brand1 wheelchair for offices');
      expect(isDate(new Date(product.createdAt))).toBeTruthy();
    });

    it('should not create product if name already in use', async () => {
      await request(app.getHttpServer())
        .post('/product')
        .set({ Authorization: `Bearer ${adminToken}` })
        .send({
          name: 'Brand1 wood table',
          picture: 'picture.jpg',
          basePrice: 139.99,
          discountPercentage: 15,
          stock: 38,
          description: 'Brand 1 wood table for offices',
        } as CreateProductDto)
        .expect(400);
    });

    it('should not create product if name already in use by case insensitive and multiple spaces', async () => {
      await request(app.getHttpServer())
        .post('/product')
        .set({ Authorization: `Bearer ${adminToken}` })
        .send({
          name: '   BraND1    wOod  TabLe      ',
          basePrice: 139.99,
        } as CreateProductDto)
        .expect(400);
    });

    it('should not create product if not admin', async () => {
      await request(app.getHttpServer())
        .post('/product')
        .set({ Authorization: `Bearer ${token}` })
        .send({
          name: 'Brand2 wood table',
          basePrice: 80.0,
        } as CreateProductDto)
        .expect(403);
    });

    it('should not create product if unauthenticated', async () => {
      await request(app.getHttpServer())
        .post('/product')
        .send({
          name: 'Brand2 wood table',
          basePrice: 80.0,
        } as CreateProductDto)
        .expect(401);
    });
  });

  describe('Get /product', () => {
    it('should return all products with default pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/product')
        .send()
        .expect(200);

      const products = response.body as Product[];

      expect(products.length).toEqual(4);
      expect(products[1].name).toEqual('Brand2 wood table');
    });

    it('should return all products with custom pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/product?page=2&offset=2')
        .send()
        .expect(200);

      const products = response.body as Product[];

      expect(products.length).toEqual(2);
      expect(products[1].name).toEqual('Brand4 wood table');
    });

    it('should return all products by searchName case insensitive', async () => {
      const response = await request(app.getHttpServer())
        .get('/product?searchName=bRaNd1')
        .send()
        .expect(200);

      const products = response.body as Product[];

      expect(products.length).toEqual(1);
      expect(products[0].name).toEqual('Brand1 wood table');
    });
  });

  describe('Get /product/id/:id', () => {
    it('should get product by id', async () => {
      const databaseProduct = await prisma.product.findUnique({
        where: { name: 'Brand2 wood table' },
      });

      const response = await request(app.getHttpServer())
        .get(`/product/id/${databaseProduct.id}`)
        .set({ Authorization: `Bearer ${adminToken}` })
        .send()
        .expect(200);

      const product = response.body as Product;

      expect(product.name).toEqual('Brand2 wood table');
      expect(product.stock).toEqual(20);
    });
  });

  describe('Get /product/:urlName', () => {
    it('should get product by urlName', async () => {
      const response = await request(app.getHttpServer())
        .get('/product/brand2-wood-table')
        .send()
        .expect(200);

      const product = response.body as Product;

      expect(product.name).toEqual('Brand2 wood table');
      expect(product.picture).toEqual('tablePicture.jpg');
      expect(product.basePrice).toEqual('123');
      expect(product.discountPercentage).toEqual(8);
      expect(product.stock).toEqual(20);
      expect(product.description).toEqual('Brand2 wood table for offices');
    });

    it('should not get product by urlName if urlName is inexistent', async () => {
      await request(app.getHttpServer())
        .get('/product/inexistent-url-name')
        .send()
        .expect(404);
    });
  });
});
