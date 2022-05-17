import { Injectable } from '@nestjs/common';
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
    const purchase = await this.prisma.purchase.create({
      data: { ...createPurchaseDto, userId },
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
        userId: { equals: userId, mode: 'insensitive' },
        productId: { equals: productId, mode: 'insensitive' },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true } },
        product: { select: { name: true } },
      },
    });

    return purchases;
  }

  /** Find purchase by ID */
  async findOne(id: string): Promise<Purchase> {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id },
      include: {
        user: { select: { email: true } },
        product: { select: { name: true } },
      },
      rejectOnNotFound: true,
    });

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
    const purchase = await this.prisma.purchase.update({
      where: { id },
      data: { ...updatePurchaseDto },
      include: {
        user: { select: { email: true } },
        product: { select: { name: true } },
      },
    });

    return purchase;
  }

  /** Removes purchase from database */
  async remove(id: string): Promise<void> {
    await this.prisma.purchase.delete({ where: { id } });
  }
}
