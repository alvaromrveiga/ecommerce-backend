import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/public.decorator';
import { IsAdmin } from 'src/common/decorators/is-admin.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { FindAllProductsDto } from './dto/find-all-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ProductService } from './product.service';

/** Exposes product CRUD endpoints */
@ApiTags('product')
@Controller('product')
export class ProductController {
  /** Exposes product CRUD endpoints
   *
   * Instantiate class and ProductService dependency
   */
  constructor(private readonly productService: ProductService) {}

  /** Creates a new product, only for admins */
  @ApiOperation({ summary: 'Admin creates a new product' })
  @ApiBearerAuth()
  @IsAdmin()
  @Post()
  create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productService.create(createProductDto);
  }

  @ApiOperation({ summary: 'Admin uploads a new product picture' })
  @ApiBearerAuth()
  @IsAdmin()
  @UseInterceptors(FileInterceptor('file'))
  @Post('picture')
  @HttpCode(HttpStatus.OK)
  uploadPhoto(@UploadedFile() file: Express.Multer.File): void {
    console.log(file);
  }

  /** Returns all products with pagination
   * Default is starting on page 1 showing 10 results per page,
   * searching and ordering by name
   */
  @ApiOperation({ summary: 'Returns all products' })
  @Public()
  @Get()
  findAll(@Query() findAllProductsDto: FindAllProductsDto): Promise<Product[]> {
    return this.productService.findAll(findAllProductsDto);
  }

  /** Find product by ID, only for admins */
  @ApiOperation({ summary: 'Admin gets product by ID' })
  @ApiBearerAuth()
  @IsAdmin()
  @Get('/id/:id')
  findOneById(@Param('id') id: string): Promise<Product> {
    return this.productService.findOneById(id);
  }

  /** Find product by Url Name */
  @ApiOperation({ summary: 'Gets product by urlName' })
  @Public()
  @Get(':urlName')
  findOneByUrlName(@Param('urlName') urlName: string): Promise<Product> {
    return this.productService.findOneByUrlName(urlName);
  }

  /** Updates product information, only for admins */
  @ApiOperation({ summary: 'Admin updates product' })
  @ApiBearerAuth()
  @IsAdmin()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productService.update(id, updateProductDto);
  }

  /** Deletes product from database, only for admins */
  @ApiOperation({ summary: 'Admin deletes product' })
  @ApiBearerAuth()
  @IsAdmin()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.productService.remove(id);
  }
}
