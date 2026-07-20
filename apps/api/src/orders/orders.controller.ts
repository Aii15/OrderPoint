import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  listActive() {
    return this.ordersService.listActiveOrders();
  }

  @Get(':midtransOrderId')
  findOne(@Param('midtransOrderId') midtransOrderId: string) {
    return this.ordersService.findByMidtransOrderId(midtransOrderId);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('orderStatus') orderStatus: OrderStatus) {
    return this.ordersService.updateOrderStatus(id, orderStatus);
  }
}