import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

// Auth "dasar" — satu PIN admin lewat env var (bukan tabel Staff dengan
// banyak akun). Cukup untuk melindungi apps/admin di tahap ini.
// Autentikasi per-staff untuk apps/cashier & apps/kds direncanakan menyusul
// (lihat README Bagian 10.B) dan bisa dibangun di atas module ini nanti.
@Injectable()
export class AuthService {
  private get jwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET belum di-set di apps/api/.env');
    }
    return secret;
  }

  login(pin: string): { token: string } {
    const adminPin = process.env.ADMIN_PIN;
    if (!adminPin) {
      throw new Error('ADMIN_PIN belum di-set di apps/api/.env');
    }

    if (pin !== adminPin) {
      throw new UnauthorizedException('PIN salah');
    }

    const token = jwt.sign({ role: 'admin' }, this.jwtSecret, { expiresIn: '12h' });
    return { token };
  }

  verify(token: string): { role: string } {
    try {
      return jwt.verify(token, this.jwtSecret) as { role: string };
    } catch {
      throw new UnauthorizedException('Token tidak valid atau kedaluwarsa');
    }
  }
}