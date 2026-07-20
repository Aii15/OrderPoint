import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3001';

export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get('orderId');

  if (!orderId) {
    return NextResponse.json({ error: 'orderId wajib diisi' }, { status: 400 });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/midtrans/status/${orderId}`);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message ?? 'Gagal mengecek status transaksi' },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Tidak dapat terhubung ke server' },
      { status: 502 },
    );
  }
}