import { BadRequestException, Body, Controller, Get, Param, Post } from '@nestjs/common';
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

interface MidtransNotificationBody {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  transaction_status: string;
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

  // Dipanggil OTOMATIS oleh server Midtrans (bukan oleh kiosk/kasir/kds)
  // begitu status transaksi berubah. Ini yang menggantikan polling manual.
  @Post('notification')
  async notification(@Body() body: MidtransNotificationBody) {
    console.log('🔔 Notifikasi masuk dari Midtrans:', body);
    const isValid = this.midtransService.verifySignature({
      orderId: body.order_id,
      statusCode: body.status_code,
      grossAmount: body.gross_amount,
      signatureKey: body.signature_key,
    });

    if (!isValid) {
      throw new BadRequestException('Signature tidak valid');
    }

    const transactionStatus = body.transaction_status;

    if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
      await this.ordersService.updatePaymentStatus(body.order_id, PaymentStatus.PAID);
    } else if (['expire', 'cancel', 'deny'].includes(transactionStatus)) {
      await this.ordersService.updatePaymentStatus(body.order_id, PaymentStatus.EXPIRED);
    }

    return { received: true };
  }

  // Tetap dipertahankan sebagai FALLBACK — dipanggil manual dari kiosk kalau-kalau
  // webhook telat/gagal terkirim (misal jaringan bermasalah), bukan lagi mekanisme utama.
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