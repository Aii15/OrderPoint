const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY ?? '';
export const MIDTRANS_BASE_URL = 'https://api.sandbox.midtrans.com/v2';

export function getMidtransAuthHeader(): string {
  const encoded = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64');
  return `Basic ${encoded}`;
}