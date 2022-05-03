import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FindAllProductsDto } from './dto/find-all-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

/** Responsible for managing products in the database.
 * CRUD endpoints are available for products.
 */
@Injectable()
export class ProductService {
  /** Responsible for managing products in the database.
   * CRUD endpoints are available for products.
   *
   * Instantiates the class and the PrismaService dependency
   */
  constructor(private readonly prisma: PrismaService) {}

  /** Creates a new product */
  async create(createProductDto: CreateProductDto): Promise<Product> {
    const urlName = this.formatUrlName(createProductDto.name);

    const product = await this.prisma.product.create({
      data: { ...createProductDto, urlName },
    });

    return product;
  }

  /** Uploads new product picture */
  async uploadPicture(id: string, file: Express.Multer.File): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data: { picture: file.filename },
    });
  }

  /** Returns all products with pagination
   * Default is starting on page 1 showing 10 results per page
   * and ordering by name
   */
  async findAll({
    searchName = '',
    page = 1,
    offset = 10,
  }: FindAllProductsDto): Promise<Product[]> {
    const productsToSkip = (page - 1) * offset;

    return this.prisma.product.findMany({
      skip: productsToSkip,
      take: offset,
      where: {
        name: { contains: searchName, mode: 'insensitive' },
      },
      orderBy: { name: 'asc' },
    });
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
    if (updateProductDto.name) {
      return this.updateProductAndUrlName(id, updateProductDto);
    }

    return this.prisma.product.update({
      where: { id },
      data: { ...updateProductDto },
    });
  }

  /** Removes product from database */
  async remove(id: string): Promise<void> {
    await this.prisma.product.delete({ where: { id } });
  }

  /** Formats the name to generate an urlName.
   *
   * Makes the name lower case, remove leading and trailing white spaces,
   * turn to single the multiple spaces between words and make
   * single spaces hyphens
   *
   * @example " BraNd1    chAir   " becomes "brand1-chair"
   */
  private formatUrlName(name: string): string {
    const lowerCaseUrlName = name.toLocaleLowerCase();
    const trimmedUrlName = lowerCaseUrlName.trim();
    const singleSpaceUrlName = trimmedUrlName.replace(/\s\s+/g, ' ');
    const spaceToHyphenUrlName = singleSpaceUrlName.split(' ').join('-');

    return spaceToHyphenUrlName;
  }

  /** Formats UrlName and updates the product with the new one.
   *
   * Used when the user updates the product name.
   */
  private updateProductAndUrlName(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const urlName = this.formatUrlName(updateProductDto.name);

    return this.prisma.product.update({
      where: { id },
      data: { ...updateProductDto, urlName },
    });
  }
}
