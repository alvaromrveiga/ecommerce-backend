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
          return product.urlName === where.urlName || product.id === where.id;
        });

        productArray[productIndex] = { ...productArray[productIndex], ...data };

        return productArray[productIndex];
      }),
      delete: jest.fn().mockImplementation(({ where }) => {
        const productIndex = productArray.findIndex((product) => {
          return product.urlName === where.urlName || product.id === where.id;
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

    await productService.create({
      name: 'Brand2 black wheelchair',
      picture: 'image.jpg',
      basePrice: '90.00',
      stock: 1,
      description: 'Black wheelchair for offices',
    });
    productArray[1].id = 'a2f891a5-4f1f-43e9-92d4-7d8e9de2bf7c';

    await productService.create({
      name: 'Brand1 table',
      picture: 'image.jpg',
      basePrice: '50.00',
      discountPercentage: 15,
      stock: 6,
      description: 'Table for offices',
    });
    productArray[2].id = '380379b4-a10f-49f0-9d0d-46a05794f0af';
  });

  it('should be defined', () => {
    expect(productService).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe('create', () => {
    it('should create product', async () => {
      await productService.create({
        name: 'Brand3 black wheelchair',
        picture: 'image.jpg',
        basePrice: '70.00',
        discountPercentage: 5,
        stock: 7,
        description: 'Black wheelchair for offices',
      });

      expect(productArray.length).toEqual(4);
      expect(productArray[3].urlName).toEqual('brand3-black-wheelchair');

      expect(prismaService.product.create).toHaveBeenCalledWith({
        data: {
          name: 'Brand3 black wheelchair',
          urlName: 'brand3-black-wheelchair',
          picture: 'image.jpg',
          basePrice: '70.00',
          discountPercentage: 5,
          stock: 7,
          description: 'Black wheelchair for offices',
        },
      });
    });
  });

  describe('findAll', () => {
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
  });

  describe('findOneById', () => {
    it('should find one product by id', async () => {
      const product = await productService.findOneById(
        'a2f891a5-4f1f-43e9-92d4-7d8e9de2bf7c',
      );

      expect(product).toEqual(productArray[1]);

      expect(prismaService.product.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'a2f891a5-4f1f-43e9-92d4-7d8e9de2bf7c' },
        }),
      );
    });
  });

  describe('findOneByUrlName', () => {
    it('should find one product by urlName', async () => {
      const product = await productService.findOneByUrlName(
        'brand1-black-wheelchair',
      );

      expect(product).toEqual(productArray[0]);

      expect(prismaService.product.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { urlName: 'brand1-black-wheelchair' },
        }),
      );
    });
  });

  describe('update', () => {
    it('should update product', async () => {
      const product = await productService.update(
        'a2f891a5-4f1f-43e9-92d4-7d8e9de2bf7c',
        {
          name: 'Brand2 black and orange wheelchair',
          picture: 'otherImage.jpg',
          basePrice: '180.00',
          discountPercentage: 50,
          description: 'Black and orange wheelchair on promotion!',
          stock: 10,
        },
      );

      expect(prismaService.product.update).toHaveBeenCalledWith({
        where: { id: 'a2f891a5-4f1f-43e9-92d4-7d8e9de2bf7c' },
        data: {
          name: 'Brand2 black and orange wheelchair',
          urlName: 'brand2-black-and-orange-wheelchair',
          picture: 'otherImage.jpg',
          basePrice: '180.00',
          discountPercentage: 50,
          description: 'Black and orange wheelchair on promotion!',
          stock: 10,
        },
      });

      expect(product.id).toEqual('a2f891a5-4f1f-43e9-92d4-7d8e9de2bf7c');
      expect(product.name).toEqual('Brand2 black and orange wheelchair');
      expect(product.urlName).toEqual('brand2-black-and-orange-wheelchair');
      expect(product.picture).toEqual('otherImage.jpg');
      expect(product.basePrice).toEqual('180.00');
      expect(product.discountPercentage).toEqual(50);
      expect(product.description).toEqual(
        'Black and orange wheelchair on promotion!',
      );
      expect(product.stock).toEqual(10);
    });
  });

  describe('remove', () => {
    it('should remove product', async () => {
      await productService.remove('a2f891a5-4f1f-43e9-92d4-7d8e9de2bf7c');

      expect(prismaService.product.delete).toHaveBeenCalledWith({
        where: { id: 'a2f891a5-4f1f-43e9-92d4-7d8e9de2bf7c' },
      });

      const product = await productService.findOneById(
        'a2f891a5-4f1f-43e9-92d4-7d8e9de2bf7c',
      );

      expect(product).toBeUndefined();
    });
  });
});
