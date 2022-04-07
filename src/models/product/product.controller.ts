import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Product } from './entities/product.entity';

/** Exposes product CRUD endpoints */
@ApiTags('product')
@ApiBearerAuth()
@Controller('product')
export class ProductController {
  /** Exposes product CRUD endpoints
   *
   * Instantiate class and ProductService dependency
   */
  constructor(private readonly productService: ProductService) {}

  /** Creates a new product */
  @ApiOperation({ summary: 'Creates a new product' })
  @Post()
  create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productService.create(createProductDto);
  }

  /** Returns all products */
  @ApiOperation({ summary: 'Returns all products' })
  @Get()
  findAll(): Promise<Product[]> {
    return this.productService.findAll();
  }

  /** Find product by ID */
  @ApiOperation({ summary: 'Gets product by ID' })
  @Get('/id/:id')
  findOneById(@Param('id') id: string): Promise<Product> {
    return this.productService.findOneById(id);
  }

  /** Find product by Url Name */
  @ApiOperation({ summary: 'Gets product by urlName' })
  @Get(':urlName')
  findOneByUrlName(@Param('urlName') urlName: string): Promise<Product> {
    return this.productService.findOneByUrlName(urlName);
  }

  /** Updates product information */
  @ApiOperation({ summary: 'Updates product' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productService.update(id, updateProductDto);
  }

  /** Deletes product from database */
  @ApiOperation({ summary: 'Deletes product' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.productService.remove(id);
  }
}
