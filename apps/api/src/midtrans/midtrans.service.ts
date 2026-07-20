import { Injectable } from '@nestjs/common';

@Injectable()
export class MidtransService {
  private readonly serverKey = process.env.MIDTRANS_SERVER_KEY ?? '';
  private readonly baseUrl = 'https://api.sandbox.midtrans.com/v2';

  private getAuthHeader(): string {
    const encoded = Buffer.from(`${this.serverKey}:`).toString('base64');
    return `Basic ${encoded}`;
  }

  async chargeQris(orderId: string, grossAmount: number, customerName?: string) {
    const response = await fetch(`${this.baseUrl}/charge`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.getAuthHeader(),
      },
      body: JSON.stringify({
        payment_type: 'qris',
        transaction_details: {
          order_id: orderId,
          gross_amount: grossAmount,
        },
        qris: {
          acquirer: 'gopay',
        },
        customer_details: customerName ? { first_name: customerName } : undefined,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.status_message ?? 'Gagal membuat transaksi QRIS');
    }

    return data;
  }

  async getTransactionStatus(orderId: string) {
    const response = await fetch(`${this.baseUrl}/${orderId}/status`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: this.getAuthHeader(),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.status_message ?? 'Gagal mengecek status transaksi');
    }

    return data;
  }
}