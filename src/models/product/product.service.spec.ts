import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Product } from './entities/product.entity';

let productArray: Product[] = [];

const PrismaServiceMock = {
  provide: PrismaService,
  useValue: {
    product: {
      create: jest.fn().mockImplementation(({ data }) => {
        productArray.push({ ...data });
      }),
      findUnique: jest.fn().mockImplementation(({ where }) => {
        return productArray.find((product) => {
          return product.urlName === where.urlName || product.id === where.id;
        });
      }),
      findMany: jest.fn().mockImplementation(() => {
        return productArray;
      }),
      update: jest.fn().mockImplementation(({ where, data }) => {
        const productIndex = productArray.findIndex((product) => {
          product.urlName === where.urlName || product.id === where.id;
        });

        productArray[productIndex] = { ...productArray[productIndex], ...data };

        return productArray[productIndex];
      }),
      delete: jest.fn().mockImplementation(({ where }) => {
        const productIndex = productArray.findIndex((product) => {
          product.urlName === where.urlName || product.id === where.id;
        });

        productArray.splice(productIndex, 1);
      }),
    },
  },
};

describe('ProductService', () => {
  let productService: ProductService;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductService, PrismaServiceMock],
    }).compile();

    productService = module.get<ProductService>(ProductService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    productArray = [];

    await productService.create({
      name: 'Brand1 black wheelchair',
      picture: 'image.jpg',
      basePrice: '80.00',
      discountPercentage: 10,
      stock: 3,
      description: 'Black wheelchair for offices',
    });
    productArray[0].id = 'c89b0c84-281e-4995-bd2a-09e0e970d8e2';
  });

  it('should be defined', () => {
    expect(productService).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe('createProduct', () => {
    it('should create product', async () => {
      await productService.create({
        name: 'Brand2 black wheelchair',
        picture: 'image.jpg',
        basePrice: '70.00',
        discountPercentage: 5,
        stock: 7,
        description: 'Black wheelchair for offices',
      });

      expect(productArray.length).toEqual(2);
      expect(productArray[1].urlName).toEqual('brand2-black-wheelchair');

      expect(prismaService.product.create).toHaveBeenCalledWith({
        data: {
          name: 'Brand2 black wheelchair',
          urlName: 'brand2-black-wheelchair',
          picture: 'image.jpg',
          basePrice: '70.00',
          discountPercentage: 5,
          stock: 7,
          description: 'Black wheelchair for offices',
        },
      });
    });
  });

  describe('findAll Products', () => {
    it('should find all products', async () => {
      const products = await productService.findAll({});

      expect(prismaService.product.findMany).toHaveBeenCalled();

      expect(products).toEqual(productArray);
    });

    it('should find all products with pagination', async () => {
      await productService.findAll({ page: 3, offset: 10 });

      expect(prismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
    });

    describe('findOne Product by Id', () => {
      it('should find one product by id', async () => {
        const product = await productService.findOneById(
          'c89b0c84-281e-4995-bd2a-09e0e970d8e2',
        );

        expect(product).toEqual(productArray[0]);

        expect(prismaService.product.findUnique).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: 'c89b0c84-281e-4995-bd2a-09e0e970d8e2' },
          }),
        );
      });
    });
  });
});
