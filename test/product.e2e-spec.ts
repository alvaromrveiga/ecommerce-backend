import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { isDate, isUUID } from 'class-validator';
import { AppModule } from 'src/app.module';
import { ProductNameInUseException } from 'src/common/exceptions/product/product-name-in-use.exception';
import { ProductNotFoundException } from 'src/common/exceptions/product/product-not-found.exception';
import { ExceptionInterceptor } from 'src/common/interceptors/exception.interceptor';
import {
  maxImageUploadSize,
  validImageUploadTypesRegex,
} from 'src/config/multer-upload.config';
import { CreateProductDto } from 'src/models/product/dto/create-product.dto';
import { UpdateProductDto } from 'src/models/product/dto/update-product.dto';
import { Product } from 'src/models/product/entities/product.entity';
import { FileTypeError } from 'src/models/product/exceptions/file-type.exception';
import { PrismaService } from 'src/prisma/prisma.service';
import request from 'supertest';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let adminToken: string;
  let product2Id: string;
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
        basePrice: 123.0,
        discountPercentage: 8,
        stock: 20,
        description: 'Brand2 wood table for offices',
      } as CreateProductDto);

    const { id } = await prisma.product.findUnique({
      where: { name: 'Brand2 wood table' },
    });

    product2Id = id;

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
      expect(product.picture).toEqual(null);
      expect(product.basePrice).toEqual('199.99');
      expect(product.discountPercentage).toEqual(10);
      expect(product.stock).toEqual(16);
      expect(product.description).toEqual('Brand1 wheelchair for offices');
      expect(isDate(new Date(product.createdAt))).toBeTruthy();
    });

    it('should not create product if name already in use', async () => {
      await expect(
        request(app.getHttpServer())
          .post('/product')
          .set({ Authorization: `Bearer ${adminToken}` })
          .send({
            name: 'Brand1 wood table',
            basePrice: 139.99,
            discountPercentage: 15,
            stock: 38,
            description: 'Brand 1 wood table for offices',
          } as CreateProductDto)
          .expect(400),
      ).resolves.toMatchObject({
        text: JSON.stringify(new ProductNameInUseException().getResponse()),
      });
    });

    it('should not create product if name already in use by case insensitive and multiple spaces', async () => {
      await expect(
        request(app.getHttpServer())
          .post('/product')
          .set({ Authorization: `Bearer ${adminToken}` })
          .send({
            name: '   BraND1    wOod  TabLe      ',
            basePrice: 139.99,
          } as CreateProductDto)
          .expect(400),
      ).resolves.toMatchObject({
        text: JSON.stringify(new ProductNameInUseException().getResponse()),
      });
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

  describe('Post /product/picture/:id', () => {
    const buffer = Buffer.from('test file');

    it('should upload picture', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/product/picture/${product2Id}`)
        .set({ Authorization: `Bearer ${adminToken}` })
        .attach('file', buffer, 'testFile.png')
        .expect(200);

      const product: Product = response.body;
      expect(product.picture.endsWith('testFile.png')).toBeTruthy();
      expect(product.picture.startsWith('testFile.png')).toBeFalsy();

      const databaseProduct = await prisma.product.findUnique({
        where: { id: product2Id },
      });

      expect(product.picture).toEqual(databaseProduct.picture);
    });

    it('should not upload picture if type is invalid', async () => {
      const buffer = Buffer.from('test file');

      await expect(
        request(app.getHttpServer())
          .patch(`/product/picture/${product2Id}`)
          .set({ Authorization: `Bearer ${adminToken}` })
          .attach('file', buffer, 'testFile.err')
          .expect(400),
      ).resolves.toMatchObject({
        text: JSON.stringify(
          new BadRequestException(
            new FileTypeError(validImageUploadTypesRegex).message,
          ).getResponse(),
        ),
      });
    });

    it('should not upload picture if file is too large', async () => {
      let blobParts = '';
      for (let i = 0; i < maxImageUploadSize + 1; i++) {
        blobParts += 'a';
      }

      const buffer = Buffer.from(blobParts);

      await request(app.getHttpServer())
        .patch(`/product/picture/${product2Id}`)
        .set({ Authorization: `Bearer ${adminToken}` })
        .attach('file', buffer, 'testFile.png')
        .expect(413);
    });

    it('should not upload picture if not admin', async () => {
      const buffer = Buffer.from('test file');

      await request(app.getHttpServer())
        .patch(`/product/picture/${product2Id}`)
        .set({ Authorization: `Bearer ${token}` })
        .attach('file', buffer, 'testFile.png')
        .expect(403);
    });

    it('should not upload picture if unauthenticated', async () => {
      const buffer = Buffer.from('test file');

      await request(app.getHttpServer())
        .patch(`/product/picture/${product2Id}`)
        .attach('file', buffer, 'testFile.png')
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

    it('should return all products by productName case insensitive', async () => {
      const response = await request(app.getHttpServer())
        .get('/product?productName=bRaNd1')
        .send()
        .expect(200);

      const products = response.body as Product[];

      expect(products.length).toEqual(1);
      expect(products[0].name).toEqual('Brand1 wood table');
    });
  });

  describe('Get /product/id/:id', () => {
    it('should get product by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/product/id/${product2Id}`)
        .set({ Authorization: `Bearer ${adminToken}` })
        .send()
        .expect(200);

      const product = response.body as Product;

      expect(product.name).toEqual('Brand2 wood table');
      expect(product.stock).toEqual(20);
    });

    it('should not get product by invalid Id', async () => {
      await expect(
        request(app.getHttpServer())
          .get(`/product/id/InvalidId`)
          .set({ Authorization: `Bearer ${adminToken}` })
          .send()
          .expect(404),
      ).resolves.toMatchObject({
        text: JSON.stringify(new ProductNotFoundException().getResponse()),
      });
    });

    it('should not get product if user is not an admin', async () => {
      await request(app.getHttpServer())
        .get(`/product/id/${product2Id}`)
        .set({ Authorization: `Bearer ${token}` })
        .send()
        .expect(403);
    });

    it('should not get product if user is unauthenticated', async () => {
      await request(app.getHttpServer())
        .get(`/product/id/${product2Id}`)
        .send()
        .expect(401);
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
      expect(product.picture).toEqual(null);
      expect(product.basePrice).toEqual('123');
      expect(product.discountPercentage).toEqual(8);
      expect(product.stock).toEqual(20);
      expect(product.description).toEqual('Brand2 wood table for offices');
    });

    it('should not get product by urlName if urlName is inexistent', async () => {
      await expect(
        request(app.getHttpServer())
          .get('/product/inexistent-url-name')
          .send()
          .expect(404),
      ).resolves.toMatchObject({
        text: JSON.stringify(new ProductNotFoundException().getResponse()),
      });
    });
  });

  describe('Patch /product/:id ', () => {
    it('should update product', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/product/${product2Id}`)
        .set({ Authorization: `Bearer ${adminToken}` })
        .send({
          name: 'Brand2 wood and glass table',
          basePrice: 219.99,
          discountPercentage: 15,
          stock: 56,
          description: 'Brand2 wood and glass table for offices',
        } as UpdateProductDto)
        .expect(200);

      const product = response.body as Product;

      expect(isUUID(product.id, 4)).toBeTruthy();
      expect(product.name).toEqual('Brand2 wood and glass table');
      expect(product.urlName).toEqual('brand2-wood-and-glass-table');
      expect(product.picture).toEqual(null);
      expect(product.basePrice).toEqual('219.99');
      expect(product.discountPercentage).toEqual(15);
      expect(product.stock).toEqual(56);
      expect(product.description).toEqual(
        'Brand2 wood and glass table for offices',
      );
      expect(isDate(new Date(product.createdAt))).toBeTruthy();
    });

    it('should not update product if name is already in use', async () => {
      await expect(
        request(app.getHttpServer())
          .patch(`/product/${product2Id}`)
          .set({ Authorization: `Bearer ${adminToken}` })
          .send({
            name: 'Brand1 wood table',
            basePrice: 91.34,
          } as UpdateProductDto)
          .expect(400),
      ).resolves.toMatchObject({
        text: JSON.stringify(new ProductNameInUseException().getResponse()),
      });
    });

    it('should not update product if id is invalid', async () => {
      await expect(
        request(app.getHttpServer())
          .patch(`/product/invalidId`)
          .set({ Authorization: `Bearer ${adminToken}` })
          .send({
            name: 'Brand2 wood and glass table',
            basePrice: 218.98,
          } as UpdateProductDto)
          .expect(404),
      ).resolves.toMatchObject({
        text: JSON.stringify(new ProductNotFoundException().getResponse()),
      });
    });

    it('should not update product if user is not and admin', async () => {
      await request(app.getHttpServer())
        .patch(`/product/${product2Id}`)
        .set({ Authorization: `Bearer ${token}` })
        .send({
          name: 'Brand2 wood and glass table',
        } as UpdateProductDto)
        .expect(403);
    });

    it('should not update product if user is unauthenticated', async () => {
      await request(app.getHttpServer())
        .patch(`/product/${product2Id}`)
        .send({
          name: 'Brand2 wood and glass table',
        } as UpdateProductDto)
        .expect(401);
    });
  });

  describe('Delete /product/:id', () => {
    it('should delete product', async () => {
      await request(app.getHttpServer())
        .delete(`/product/${product2Id}`)
        .set({ Authorization: `Bearer ${adminToken}` })
        .send()
        .expect(204);
    });

    it('should not delete product if id is invalid', async () => {
      await expect(
        request(app.getHttpServer())
          .delete(`/product/InvalidId`)
          .set({ Authorization: `Bearer ${adminToken}` })
          .send()
          .expect(404),
      ).resolves.toMatchObject({
        text: JSON.stringify(new ProductNotFoundException().getResponse()),
      });
    });

    it('should not delete product if user is not admin', async () => {
      await request(app.getHttpServer())
        .delete(`/product/${product2Id}`)
        .set({ Authorization: `Bearer ${token}` })
        .send()
        .expect(403);
    });

    it('should not delete product if unauthenticated', async () => {
      await request(app.getHttpServer())
        .delete(`/product/${product2Id}`)
        .send()
        .expect(401);
    });
  });
});
