import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersQuickController } from './orders.quick.controller';

import { PromotionsModule } from '../promotions/promotions.module';
import { PromotionsService } from '../promotions/promotions.service';

@Module({
  imports: [PromotionsModule],
  providers: [OrdersService],
  controllers: [OrdersController, OrdersQuickController]
})
export class OrdersModule {}
