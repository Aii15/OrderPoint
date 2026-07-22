import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

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

  // Memverifikasi bahwa notifikasi webhook benar-benar datang dari Midtrans,
  // bukan dari pihak lain yang berpura-pura. Formula resmi dari dokumentasi
  // Midtrans: SHA512(order_id + status_code + gross_amount + ServerKey)
  verifySignature(params: {
    orderId: string;
    statusCode: string;
    grossAmount: string;
    signatureKey: string;
  }): boolean {
    const raw = `${params.orderId}${params.statusCode}${params.grossAmount}${this.serverKey}`;
    const expected = createHash('sha512').update(raw).digest('hex');
    return expected === params.signatureKey;
  }
}