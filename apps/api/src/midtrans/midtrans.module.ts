import { Module } from '@nestjs/common';
import { MidtransController } from './midtrans.controller';
import { MidtransService } from './midtrans.service';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [OrdersModule],
  controllers: [MidtransController],
  providers: [MidtransService],
})
export class MidtransModule {}