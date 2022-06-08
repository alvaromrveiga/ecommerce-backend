import { Provider } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime';
import { PrismaService } from 'src/prisma/prisma.service';
import { Product } from '../product/entities/product.entity';
import { Purchase } from './entities/purchase.entity';
import { NotPurchaseOwnerException } from './exceptions/not-purchase-owner.exception';
import { PurchaseService } from './purchase.service';

let purchaseArray: Purchase[];

const productArray: Product[] = [
  {
    id: 'ce9873bd-d469-4f78-9405-ace81957c624',
    basePrice: new Decimal(71.01),
    name: 'TestProduct1',
    urlName: 'testproduct1',
  },
  {
    id: 'ebd4e8b2-1c65-43c7-998b-ce7f0f2364f1',
    basePrice: new Decimal(69.99),
    name: 'TestProduct2',
    urlName: 'testproduct2',
  },
];

const PrismaServiceMock = {
  provide: PrismaService,
  useValue: {
    purchase: {
      create: jest.fn().mockImplementation(({ data }) => {
        purchaseArray.push({ ...data });
        return purchaseArray[purchaseArray.length - 1];
      }),
      findUnique: jest.fn().mockImplementation(({ where }) => {
        return purchaseArray.find((purchase) => {
          return purchase.id === where.id;
        });
      }),
      findMany: jest.fn().mockImplementation(() => {
        return purchaseArray;
      }),
      update: jest.fn().mockImplementation(({ where, data }) => {
        const purchaseIndex = purchaseArray.findIndex((purchase) => {
          return purchase.id === where.id;
        });

        purchaseArray[purchaseIndex] = {
          ...purchaseArray[purchaseIndex],
          ...data,
        };

        return purchaseArray[purchaseIndex];
      }),
      delete: jest.fn().mockImplementation(({ where }) => {
        const purchaseIndex = purchaseArray.findIndex((purchase) => {
          return purchase.id === where.id;
        });

        purchaseArray.splice(purchaseIndex, 1);
      }),
    },
    product: {
      findUnique: jest.fn().mockImplementation(({ where }) => {
        return productArray.find((product) => {
          return product.id === where.id;
        });
      }),
    },
  },
} as Provider;

describe('PurchaseService', () => {
  let purchaseService: PurchaseService;
  let prismaService: PrismaService;

  const user1Id = '89f04688-f602-443b-94a1-d25385e2124a';
  const user2Id = 'bbfa050f-d297-47c4-90ed-cb2f5d8a5b6a';

  const purchase1Id = 'd303b321-e99a-41ad-94be-d98526b4f7be';
  const purchase2Id = '26cd45c9-af93-456b-a77a-6f600145bbae';
  const purchase3Id = '4e902b48-5e68-4d46-899a-e23059209a66';
  const purchase4Id = 'bc47bc85-8207-466d-a071-e804806ea08d';

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PurchaseService, PrismaServiceMock],
    }).compile();

    purchaseService = module.get<PurchaseService>(PurchaseService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    purchaseArray = [];

    await purchaseService.create(user1Id, {
      productId: productArray[0].id,
      amount: 2,
    });
    purchaseArray[0].id = purchase1Id;

    await purchaseService.create(user2Id, {
      productId: productArray[0].id,
      amount: 3,
    });
    purchaseArray[1].id = purchase2Id;

    await purchaseService.create(user1Id, {
      productId: productArray[1].id,
      amount: 4,
    });
    purchaseArray[2].id = purchase3Id;

    await purchaseService.create(user2Id, {
      productId: productArray[1].id,
      amount: 5,
    });
    purchaseArray[3].id = purchase4Id;

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(purchaseService).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe('create', () => {
    it('should create purchase', async () => {
      const purchase = await purchaseService.create(user1Id, {
        productId: productArray[0].id,
        amount: 5,
      });

      expect(purchaseArray.length).toEqual(5);
      expect(purchase).toEqual(purchaseArray[4]);

      expect(purchase.userId).toEqual(user1Id);
      expect(purchase.productId).toEqual(productArray[0].id);
      expect(purchase.totalPrice).toEqual(355.05);
      expect(purchase.amount).toEqual(5);

      expect(prismaService.purchase.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            userId: user1Id,
            productId: productArray[0].id,
            totalPrice: 355.05,
            amount: 5,
          },
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should find all purchases with default pagination', async () => {
      const purchases = await purchaseService.findAll({});

      expect(purchases).toEqual(purchaseArray);
      expect(prismaService.purchase.findMany).toHaveBeenCalled();
    });

    it('should find all purchases with custom pagination', async () => {
      const purchases = await purchaseService.findAll({ page: 3, offset: 20 });

      expect(purchases).toEqual(purchaseArray);
      expect(prismaService.purchase.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 40, take: 20 }),
      );
    });

    it('should find all purchases filtering by user ID and product ID', async () => {
      await purchaseService.findAll({
        userId: user1Id,
        productId: productArray[1].id,
      });

      expect(prismaService.purchase.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: { equals: user1Id },
            productId: { equals: productArray[1].id },
          },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should find one purchase by id', async () => {
      const purchase = await purchaseService.findOne(
        purchase2Id,
        user2Id,
        Role.USER,
      );

      expect(purchase.id).toEqual(purchase2Id);
      expect(purchase).toEqual(purchaseArray[1]);

      expect(prismaService.purchase.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: purchase2Id },
          rejectOnNotFound: true,
        }),
      );
    });

    it('should find purchase by id if user do not own the purchase but is an admin', async () => {
      const purchase = await purchaseService.findOne(
        purchase2Id,
        'adminId',
        Role.ADMIN,
      );

      expect(purchase.id).toEqual(purchase2Id);
      expect(purchase).toEqual(purchaseArray[1]);

      expect(prismaService.purchase.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: purchase2Id },
          rejectOnNotFound: true,
        }),
      );
    });

    it('should not find purchase by id if user do not own the purchase and is not admin', async () => {
      await expect(
        purchaseService.findOne(purchase2Id, user1Id, Role.USER),
      ).rejects.toThrow(new NotPurchaseOwnerException());
    });
  });

  describe('review', () => {
    it('should review purchased product', async () => {
      const purchase = await purchaseService.review(user1Id, purchase3Id, {
        reviewNote: 5,
        reviewComment: 'Amazing product!',
      });

      expect(purchase.id).toEqual(purchase3Id);
      expect(purchase.reviewNote).toEqual(5);
      expect(purchase.reviewComment).toEqual('Amazing product!');

      expect(prismaService.purchase.findUnique).toBeCalledWith({
        where: { id: purchase3Id },
        rejectOnNotFound: true,
      });

      expect(prismaService.purchase.update).toBeCalledWith(
        expect.objectContaining({
          where: { id: purchase3Id },
          data: { reviewNote: 5, reviewComment: 'Amazing product!' },
        }),
      );
    });

    it('should not review purchased product if user does not own the purchase', async () => {
      await expect(
        purchaseService.review(user2Id, purchase3Id, {
          reviewNote: 1,
          reviewComment: 'I do not own this purchase',
        }),
      ).rejects.toThrow(new NotPurchaseOwnerException());
    });
  });

  describe('update', () => {
    it('should update purchase', async () => {
      const purchase = await purchaseService.update(purchase2Id, {
        productId: productArray[1].id,
        amount: 15,
      });

      expect(purchase.id).toEqual(purchase2Id);
      expect(purchase.productId).toEqual(productArray[1].id);
      expect(purchase.totalPrice).toEqual(1049.85);
      expect(purchase.amount).toEqual(15);

      expect(prismaService.purchase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: purchase2Id },
          data: {
            productId: productArray[1].id,
            totalPrice: 1049.85,
            amount: 15,
          },
        }),
      );
    });
  });

  describe('remove', () => {
    it('should delete purchase', async () => {
      await purchaseService.remove(purchase2Id);

      expect(purchaseArray.length).toEqual(3);

      expect(prismaService.purchase.delete).toHaveBeenCalledWith({
        where: { id: purchase2Id },
      });

      const purchase = await purchaseService.findOne(
        purchase2Id,
        'adminId',
        Role.ADMIN,
      );

      expect(purchase).toBeUndefined();
    });
  });
});
