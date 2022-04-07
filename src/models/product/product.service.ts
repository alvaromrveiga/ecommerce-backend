import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

/** Responsible for managing products in the database.
 * CRUD endpoints are available for products.
 */
@Injectable()
export class ProductService {
  /** Responsible for managing users in the database.
   * CRUD endpoints are available for users.
   *
   * Instantiates the class and the PrismaService dependency
   */
  constructor(private readonly prisma: PrismaService) {}

  /** Creates a new product */
  async create(createProductDto: CreateProductDto): Promise<Product> {
    const lowerCaseUrlName = createProductDto.name.toLocaleLowerCase();
    const spaceToHyphenUrlName = lowerCaseUrlName.split(' ').join('-');

    const product = await this.prisma.product.create({
      data: { ...createProductDto, urlName: spaceToHyphenUrlName },
    });

    return product;
  }

  /** Returns all products */
  async findAll(): Promise<Product[]> {
    return this.prisma.product.findMany();
  }

  /** Find product by ID */
  async findOneById(id: string): Promise<Product> {
    return this.prisma.product.findUnique({
      where: { id },
      rejectOnNotFound: true,
    });
  }

  /** Find product by Url Name */
  async findOneByUrlName(urlName: string): Promise<Product> {
    return this.prisma.product.findUnique({
      where: { urlName },
      rejectOnNotFound: true,
    });
  }

  /** Updates product information */
  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data: { ...updateProductDto },
    });
  }

  /** Removes product from database */
  async remove(id: string): Promise<void> {
    this.prisma.product.delete({ where: { id } });
  }
}
