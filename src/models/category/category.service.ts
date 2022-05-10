import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindProductsDto } from '../product/dto/find-products.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { FindCategoriesDto } from './dto/find-categories.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

/** Responsible for managing categories in the database.
 * CRUD endpoints are available for categories.
 */
@Injectable()
export class CategoryService {
  /** Responsible for managing categories in the database.
   * CRUD endpoints are available for categories.
   *
   * Instantiates the class and the PrismaService dependency
   */
  constructor(private readonly prisma: PrismaService) {}

  /** Creates a new category */
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const name = this.capitalizeOnlyFirstLetter(createCategoryDto.name);

    const category = await this.prisma.category.create({
      data: { ...createCategoryDto, name },
    });

    return category;
  }

  /** Returns all categories with pagination and can search by name
   * Default is starting on page 1 showing 10 results per page
   * and ordering by name
   */
  async findAll({
    categoryName = '',
    page = 1,
    offset = 10,
  }: FindCategoriesDto): Promise<Category[]> {
    const categoriesToSkip = (page - 1) * offset;

    return this.prisma.category.findMany({
      skip: categoriesToSkip,
      take: offset,
      where: {
        name: { contains: categoryName, mode: 'insensitive' },
      },
      orderBy: { name: 'asc' },
    });
  }

  /** Find category by ID and show the products that have this category */
  async findOneById(
    id: string,
    { productName = '', page = 1, offset = 10 }: FindProductsDto,
  ): Promise<Category> {
    const productsToSkip = (page - 1) * offset;

    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          select: { id: true, name: true, urlName: true, picture: true },
          where: { name: { contains: productName, mode: 'insensitive' } },
          skip: productsToSkip,
          take: offset,
        },
      },
      rejectOnNotFound: true,
    });

    return category;
  }

  /** Find category by name and show the products that have this category */
  async findOneByName(
    name: string,
    { productName = '', page = 1, offset = 10 }: FindProductsDto,
  ): Promise<Category> {
    const productsToSkip = (page - 1) * offset;

    name = this.capitalizeOnlyFirstLetter(name);

    const category = await this.prisma.category.findUnique({
      where: { name },
      include: {
        products: {
          select: { id: true, name: true, urlName: true, picture: true },
          where: { name: { contains: productName, mode: 'insensitive' } },
          skip: productsToSkip,
          take: offset,
        },
      },
      rejectOnNotFound: true,
    });

    return category;
  }

  /** Updates category information */
  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    if (updateCategoryDto.name) {
      return this.updateCategoryAndName(id, updateCategoryDto);
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: { ...updateCategoryDto },
    });

    return category;
  }

  /** Removes category from database */
  async remove(id: string): Promise<void> {
    await this.prisma.category.delete({ where: { id } });
  }

  /** Capitalize only the first letter of the category name */
  private capitalizeOnlyFirstLetter(name: string): string {
    return name[0].toUpperCase() + name.substring(1).toLocaleLowerCase();
  }

  /** Formats name and updates the category with the new one.
   *
   * Used when the user updates the category name.
   */
  private updateCategoryAndName(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const name = this.capitalizeOnlyFirstLetter(updateCategoryDto.name);

    return this.prisma.category.update({
      where: { id },
      data: { ...updateCategoryDto, name },
    });
  }
}
