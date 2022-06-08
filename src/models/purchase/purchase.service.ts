import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import currency from 'currency.js';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { FindPurchasesDto } from './dto/find-purchases.dto';
import { ReviewPurchaseDto } from './dto/review-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { Purchase } from './entities/purchase.entity';
import { NotPurchaseOwnerException } from './exceptions/not-purchase-owner.exception';

/** Responsible for managing purchases in the database.
 * CRUD endpoints are available for purchases.
 */
@Injectable()
export class PurchaseService {
  /** Responsible for managing purchases in the database.
   * CRUD endpoints are available for purchases.
   *
   * Instantiates the class and the PrismaService dependency
   */
  constructor(private readonly prisma: PrismaService) {}

  /** Creates a new purchase */
  async create(
    userId: string,
    createPurchaseDto: CreatePurchaseDto,
  ): Promise<Purchase> {
    const totalPrice = await this.calculateTotalPrice(createPurchaseDto);

    const purchase = await this.prisma.purchase.create({
      data: { ...createPurchaseDto, userId, totalPrice },
      include: {
        user: { select: { email: true } },
        product: { select: { name: true } },
      },
    });

    return purchase;
  }

  /** Returns all purchases with pagination
   * Default is starting on page 1 showing 10 results per page
   * and ordering by name
   */
  async findAll({
    userId,
    productId,
    page = 1,
    offset = 10,
  }: FindPurchasesDto): Promise<Purchase[]> {
    const purchasesToSkip = (page - 1) * offset;

    const purchases = await this.prisma.purchase.findMany({
      skip: purchasesToSkip,
      take: offset,
      where: {
        userId: { equals: userId },
        productId: { equals: productId },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true } },
        product: { select: { name: true } },
      },
    });

    return purchases;
  }

  /** Find purchase by ID, normal users can only get their purchases,
   * Admins can get any.
   */
  async findOne(
    purchaseId: string,
    userId: string,
    userRole: string,
  ): Promise<Purchase> {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        user: { select: { email: true } },
        product: { select: { name: true } },
      },
      rejectOnNotFound: true,
    });

    if (userRole !== Role.ADMIN && purchase.userId !== userId) {
      throw new NotPurchaseOwnerException();
    }

    return purchase;
  }

  /** Users review products purchased by them */
  async review(
    userId: string,
    purchaseId: string,
    reviewPurchaseDto: ReviewPurchaseDto,
  ): Promise<Purchase> {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id: purchaseId },
      rejectOnNotFound: true,
    });

    if (userId !== purchase.userId) {
      throw new NotPurchaseOwnerException();
    }

    return this.prisma.purchase.update({
      where: { id: purchaseId },
      data: { ...reviewPurchaseDto },
      include: {
        user: { select: { email: true } },
        product: { select: { name: true } },
      },
    });
  }

  /** Updates purchase information */
  async update(
    id: string,
    updatePurchaseDto: UpdatePurchaseDto,
  ): Promise<Purchase> {
    const purchase = await this.prisma.purchase.findUnique({ where: { id } });

    const productId = updatePurchaseDto.productId || purchase.productId;
    const amount = updatePurchaseDto.amount || purchase.amount;
    const totalPrice = await this.calculateTotalPrice({ productId, amount });

    const updatedPurchase = await this.prisma.purchase.update({
      where: { id },
      data: { ...updatePurchaseDto, totalPrice },
      include: {
        user: { select: { email: true } },
        product: { select: { name: true } },
      },
    });

    return updatedPurchase;
  }

  /** Removes purchase from database */
  async remove(id: string): Promise<void> {
    await this.prisma.purchase.delete({ where: { id } });
  }

  private async calculateTotalPrice(
    createPurchaseDto: CreatePurchaseDto,
  ): Promise<number> {
    const { basePrice } = await this.prisma.product.findUnique({
      where: { id: createPurchaseDto.productId },
    });

    const totalPrice = currency(basePrice.toNumber()).multiply(
      createPurchaseDto.amount,
    );

    return totalPrice.value;
  }
}
