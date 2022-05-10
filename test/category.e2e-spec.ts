import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { isUUID } from 'class-validator';
import { AppModule } from 'src/app.module';
import { CategoryNameInUseException } from 'src/common/exceptions/category/category-name-in-use.exception';
import { ExceptionInterceptor } from 'src/common/interceptors/exception.interceptor';
import { CreateCategoryDto } from 'src/models/category/dto/create-category.dto';
import { Category } from 'src/models/category/entities/category.entity';
import { CreateProductDto } from 'src/models/product/dto/create-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import request from 'supertest';

describe('CategoryController (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let adminToken: string;
  let prisma: PrismaService;
  let categoryIds: string[];

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
    await prisma.category.deleteMany();
    categoryIds = [];

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

    response = await request(app.getHttpServer())
      .post('/category')
      .set({ Authorization: `Bearer ${adminToken}` })
      .send({ name: 'Madeira' });
    categoryIds.push(response.body.id);

    response = await request(app.getHttpServer())
      .post('/category')
      .set({ Authorization: `Bearer ${adminToken}` })
      .send({ name: 'Madeira de lei' });
    categoryIds.push(response.body.id);

    response = await request(app.getHttpServer())
      .post('/category')
      .set({ Authorization: `Bearer ${adminToken}` })
      .send({ name: 'Casa' });
    categoryIds.push(response.body.id);

    response = await request(app.getHttpServer())
      .post('/category')
      .set({ Authorization: `Bearer ${adminToken}` })
      .send({ name: 'Higiene' });
    categoryIds.push(response.body.id);

    await request(app.getHttpServer())
      .post('/product')
      .set({ Authorization: `Bearer ${adminToken}` })
      .send({
        name: 'Brand2 wood table',
        basePrice: 123.0,
        categories: [categoryIds[1]],
      } as CreateProductDto);
  });

  describe('Post /category', () => {
    it('should create category', async () => {
      const response = await request(app.getHttpServer())
        .post('/category')
        .set({ Authorization: `Bearer ${adminToken}` })
        .send({ name: 'saBoNetE' } as CreateCategoryDto)
        .expect(201);

      const category: Category = response.body;
      expect(category.name).toEqual('Sabonete');

      const databaseCategory = await prisma.category.findUnique({
        where: { name: 'Sabonete' },
      });

      expect(databaseCategory).toBeDefined();
      expect(category).toEqual(databaseCategory);
      expect(isUUID(category.id, '4')).toBeTruthy();
    });

    it('should not create category with name already in use', async () => {
      await expect(
        request(app.getHttpServer())
          .post('/category')
          .set({ Authorization: `Bearer ${adminToken}` })
          .send({ name: 'Casa' } as CreateCategoryDto)
          .expect(400),
      ).resolves.toMatchObject({
        text: JSON.stringify(new CategoryNameInUseException().getResponse()),
      });
    });

    it('should not create category with name already in use capitalizing only first letter', async () => {
      await expect(
        request(app.getHttpServer())
          .post('/category')
          .set({ Authorization: `Bearer ${adminToken}` })
          .send({ name: 'cASa' } as CreateCategoryDto)
          .expect(400),
      ).resolves.toMatchObject({
        text: JSON.stringify(new CategoryNameInUseException().getResponse()),
      });
    });

    it('should not create category if not admin', async () => {
      await request(app.getHttpServer())
        .post('/category')
        .set({ Authorization: `Bearer ${token}` })
        .send({ name: 'Sabonete' } as CreateCategoryDto)
        .expect(403);
    });

    it('should not create category if unauthenticated', async () => {
      await request(app.getHttpServer())
        .post('/category')
        .send({ name: 'Sabonete' } as CreateCategoryDto)
        .expect(401);
    });
  });

  describe('Get /category', () => {
    it('should find all categories with default pagination ordered by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/category')
        .send()
        .expect(200);

      const categories: Category[] = response.body;

      expect(categories.length).toEqual(4);
      expect(categories[2].name).toEqual('Madeira');
    });

    it('should find all categories with custom pagination ordered by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/category?page=2&offset=2')
        .send()
        .expect(200);

      const categories: Category[] = response.body;

      expect(categories.length).toEqual(2);
      expect(categories[0].name).toEqual('Madeira');
    });

    it('should find all categories by category name insensitive ordered by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/category?categoryName=Made')
        .send()
        .expect(200);

      const categories: Category[] = response.body;

      expect(categories.length).toEqual(2);
      expect(categories[1].name).toEqual('Madeira de lei');
    });
  });
});
