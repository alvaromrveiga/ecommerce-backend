import { Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';

@Module({
  controllers: [PurchaseController],
  providers: [PurchaseService]
})
export class PurchaseModule {}
