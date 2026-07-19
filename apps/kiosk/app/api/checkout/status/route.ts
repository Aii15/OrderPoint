import { NextRequest, NextResponse } from 'next/server';
import { getMidtransAuthHeader, MIDTRANS_BASE_URL } from '@/lib/midtrans';

export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get('orderId');

  if (!orderId) {
    return NextResponse.json({ error: 'orderId wajib diisi' }, { status: 400 });
  }

  try {
    const midtransResponse = await fetch(`${MIDTRANS_BASE_URL}/${orderId}/status`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: getMidtransAuthHeader(),
      },
    });

    const data = await midtransResponse.json();

    if (!midtransResponse.ok) {
      return NextResponse.json(
        { error: data.status_message ?? 'Gagal mengecek status transaksi' },
        { status: midtransResponse.status },
      );
    }

    return NextResponse.json({
      transactionStatus: data.transaction_status,
      fraudStatus: data.fraud_status ?? null,
    });
  } catch (error) {
    console.error('Midtrans status check error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server pembayaran' }, { status: 500 });
  }
}