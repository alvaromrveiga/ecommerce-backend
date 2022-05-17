import { Provider } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { Purchase } from './entities/purchase.entity';
import { PurchaseService } from './purchase.service';

let purchaseArray: Purchase[];

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
  },
} as Provider;

describe('PurchaseService', () => {
  let purchaseService: PurchaseService;
  let prismaService: PrismaService;

  const user1Id = '89f04688-f602-443b-94a1-d25385e2124a';
  const user2Id = 'bbfa050f-d297-47c4-90ed-cb2f5d8a5b6a';

  const product1Id = 'ce9873bd-d469-4f78-9405-ace81957c624';
  const product2Id = 'ebd4e8b2-1c65-43c7-998b-ce7f0f2364f1';

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
      productId: product1Id,
      totalPrice: 140,
      amount: 2,
    });
    purchaseArray[0].id = purchase1Id;

    await purchaseService.create(user2Id, {
      productId: product1Id,
      totalPrice: 200,
      amount: 3,
    });
    purchaseArray[1].id = purchase2Id;

    await purchaseService.create(user1Id, {
      productId: product2Id,
      totalPrice: 260,
      amount: 4,
    });
    purchaseArray[2].id = purchase3Id;

    await purchaseService.create(user2Id, {
      productId: product2Id,
      totalPrice: 300,
      amount: 5,
    });
    purchaseArray[3].id = purchase4Id;
  });

  it('should be defined', () => {
    expect(purchaseService).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe('create', () => {
    it('should create purchase', async () => {
      const purchase = await purchaseService.create(user1Id, {
        productId: product1Id,
        totalPrice: 355.03,
        amount: 5,
      });

      expect(purchaseArray.length).toEqual(5);
      expect(purchase).toEqual(purchaseArray[4]);

      expect(purchase.userId).toEqual(user1Id);
      expect(purchase.productId).toEqual(product1Id);
      expect(purchase.totalPrice).toEqual(355.03);
      expect(purchase.amount).toEqual(5);

      expect(prismaService.purchase.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            userId: user1Id,
            productId: product1Id,
            totalPrice: 355.03,
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
        productId: product2Id,
      });

      expect(prismaService.purchase.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: { equals: user1Id },
            productId: { equals: product2Id },
          },
        }),
      );
    });
  });
});
