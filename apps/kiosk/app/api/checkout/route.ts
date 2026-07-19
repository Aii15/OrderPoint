import { NextRequest, NextResponse } from 'next/server';
import { getMidtransAuthHeader, MIDTRANS_BASE_URL } from '@/lib/midtrans';
import { getNextQueueNumber } from '@/lib/queue-number';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { total, customerName } = body as { total: number; customerName?: string };

    if (!total || total <= 0) {
      return NextResponse.json({ error: 'Total pembayaran tidak valid' }, { status: 400 });
    }

    const queueNumber = getNextQueueNumber();
    const orderId = `ORDERPOINT-${Date.now()}`;

    const midtransResponse = await fetch(`${MIDTRANS_BASE_URL}/charge`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: getMidtransAuthHeader(),
      },
      body: JSON.stringify({
        payment_type: 'qris',
        transaction_details: {
          order_id: orderId,
          gross_amount: total,
        },
        qris: {
          acquirer: 'gopay',
        },
        customer_details: customerName
          ? {
              first_name: customerName,
            }
          : undefined,
      }),
    });

    const data = await midtransResponse.json();

    if (!midtransResponse.ok) {
      return NextResponse.json(
        { error: data.status_message ?? 'Gagal membuat transaksi QRIS' },
        { status: midtransResponse.status },
      );
    }

    const qrAction = (data.actions as { name: string; url: string }[] | undefined)?.find(
      (action) => action.name === 'generate-qr-code',
    );

    return NextResponse.json({
      orderId: data.order_id,
      queueNumber,
      transactionId: data.transaction_id,
      grossAmount: data.gross_amount,
      qrUrl: qrAction?.url ?? null,
      expiryTime: data.expiry_time ?? null,
      transactionStatus: data.transaction_status,
    });
  } catch (error) {
    console.error('Midtrans charge error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server pembayaran' }, { status: 500 });
  }
}