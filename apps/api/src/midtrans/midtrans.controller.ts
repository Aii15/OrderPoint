import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { MidtransService } from './midtrans.service';
import { OrdersService } from '../orders/orders.service';

interface ChargeRequestBody {
  customerName: string;
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  tax: number;
  total: number;
}

@Controller('midtrans')
export class MidtransController {
  constructor(
    private readonly midtransService: MidtransService,
    private readonly ordersService: OrdersService,
  ) {}

  @Post('charge')
  async charge(@Body() body: ChargeRequestBody) {
    const midtransOrderId = `ORDERPOINT-${Date.now()}`;

    const midtransResponse = await this.midtransService.chargeQris(
      midtransOrderId,
      body.total,
      body.customerName,
    );

    const order = await this.ordersService.createOrder(
      {
        customerName: body.customerName,
        items: body.items,
        subtotal: body.subtotal,
        tax: body.tax,
        total: body.total,
      },
      midtransOrderId,
    );

    const qrAction = (midtransResponse.actions as { name: string; url: string }[] | undefined)?.find(
      (action) => action.name === 'generate-qr-code',
    );

    return {
      orderId: midtransOrderId,
      queueNumber: order.queueNumber,
      qrUrl: qrAction?.url ?? null,
      expiryTime: midtransResponse.expiry_time ?? null,
    };
  }

  @Get('status/:orderId')
  async status(@Param('orderId') orderId: string) {
    const midtransData = await this.midtransService.getTransactionStatus(orderId);
    const transactionStatus = midtransData.transaction_status as string;

    if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
      await this.ordersService.updatePaymentStatus(orderId, PaymentStatus.PAID);
    } else if (['expire', 'cancel', 'deny'].includes(transactionStatus)) {
      await this.ordersService.updatePaymentStatus(orderId, PaymentStatus.EXPIRED);
    }

    return { transactionStatus };
  }
}