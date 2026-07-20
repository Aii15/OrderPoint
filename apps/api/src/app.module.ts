import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { OrdersModule } from './orders/orders.module';
import { MidtransModule } from './midtrans/midtrans.module';

@Module({
  imports: [PrismaModule, OrdersModule, MidtransModule],
})
export class AppModule {}