import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  listActive() {
    return this.ordersService.listActiveOrders();
  }

  @Get('failed')
  listFailed() {
    return this.ordersService.listFailedOrders();
  }

  @Get('completed-today')
  listCompletedToday() {
    return this.ordersService.listCompletedToday();
  }

  // BARU (apps/admin) — ?date=YYYY-MM-DD, default hari ini kalau tidak diisi
  @Get('history')
  listHistory(@Query('date') date?: string) {
    return this.ordersService.listByDate(date);
  }

  // BARU (apps/admin) — detail satu order lewat id internal, dipakai /riwayat/[id]
  @Get('detail/:id')
  findById(@Param('id') id: string) {
    return this.ordersService.findById(id);
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