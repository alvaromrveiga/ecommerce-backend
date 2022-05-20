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
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { IsAdmin } from 'src/common/decorators/is-admin.decorator';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { FindPurchasesDto } from './dto/find-purchases.dto';
import { ReviewPurchaseDto } from './dto/review-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { Purchase } from './entities/purchase.entity';
import { PurchaseService } from './purchase.service';

/** Exposes purchase CRUD endpoints */
@ApiTags('purchase')
@Controller('purchase')
export class PurchaseController {
  /** Exposes purchase CRUD endpoints
   *
   * Instantiate class and PurchaseService dependency
   */
  constructor(private readonly purchaseService: PurchaseService) {}

  /** Creates a new purchase, only for logged users */
  @ApiOperation({ summary: 'Creates a new purchase' })
  @ApiBearerAuth()
  @Post()
  async create(
    @Req() request: Request,
    @Body() createPurchaseDto: CreatePurchaseDto,
  ): Promise<Purchase> {
    const { userId } = request.user as { userId: string };

    return this.purchaseService.create(userId, createPurchaseDto);
  }

  /** Returns all purchases with pagination, only for admins
   *
   * Default is starting on page 1 showing 10 results per page,
   * matching by userId and/or productId and ordering by most recent date
   */
  @ApiOperation({ summary: 'Admin gets all purchases' })
  @IsAdmin()
  @Get('/admin')
  async findAll(
    @Query() findPurchasesDto: FindPurchasesDto,
  ): Promise<Purchase[]> {
    return this.purchaseService.findAll(findPurchasesDto);
  }

  /** Returns all users' purchases with pagination,
   *
   * Default is starting on page 1 showing 10 results per page,
   * matching by productId and ordering by most recent date
   */
  @ApiOperation({ summary: 'User gets all their purchases' })
  @ApiBearerAuth()
  @Get()
  async findAllMine(
    @Req() request: Request,
    @Query() findPurchasesDto: FindPurchasesDto,
  ): Promise<Purchase[]> {
    const { userId } = request.user as { userId: string };
    findPurchasesDto.userId = userId;

    return this.purchaseService.findAll(findPurchasesDto);
  }

  /** Find purchase by ID, normal users can only get their purchases,
   * Admins can get any.
   */
  @ApiOperation({ summary: 'Returns purchase by ID' })
  @ApiBearerAuth()
  @Get(':id')
  async findOne(
    @Req() request: Request,
    @Param('id') purchaseId: string,
  ): Promise<Purchase> {
    const { userId, userRole } = request.user as {
      userId: string;
      userRole: string;
    };

    return this.purchaseService.findOne(purchaseId, userId, userRole);
  }

  /** Reviews purchased product, must be purchase owner */
  @ApiOperation({ summary: 'Reviews purchased product' })
  @ApiBearerAuth()
  @Patch('/review/:id')
  async review(
    @Req() request: Request,
    @Param('id') purchaseId: string,
    @Body() reviewPurchaseDto: ReviewPurchaseDto,
  ): Promise<Purchase> {
    const { userId } = request.user as { userId: string };

    return this.purchaseService.review(userId, purchaseId, reviewPurchaseDto);
  }

  /** Updates purchase information, only for admins */
  @ApiOperation({ summary: 'Admin updates purchase' })
  @IsAdmin()
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePurchaseDto: UpdatePurchaseDto,
  ): Promise<Purchase> {
    return this.purchaseService.update(id, updatePurchaseDto);
  }

  /** Deletes purchase from database, only for admins */
  @ApiOperation({ summary: 'Admin deletes purchase' })
  @IsAdmin()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.purchaseService.remove(id);
  }
}
