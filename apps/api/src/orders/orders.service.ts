import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private getDateKey(): string {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  }

  async getNextQueueNumber(): Promise<string> {
    const todayKey = this.getDateKey();

    return this.prisma.$transaction(async (tx) => {
      let counterRow = await tx.queueCounter.findUnique({ where: { id: 'singleton' } });

      if (!counterRow) {
        counterRow = await tx.queueCounter.create({
          data: { id: 'singleton', dateKey: todayKey, counter: 0 },
        });
      }

      if (counterRow.dateKey !== todayKey) {
        counterRow = await tx.queueCounter.update({
          where: { id: 'singleton' },
          data: { dateKey: todayKey, counter: 0 },
        });
      }

      const updated = await tx.queueCounter.update({
        where: { id: 'singleton' },
        data: { counter: { increment: 1 } },
      });

      const letter = String.fromCharCode(65 + Math.floor((updated.counter - 1) / 100));
      const number = ((updated.counter - 1) % 100) + 1;

      return `${letter}-${number.toString().padStart(3, '0')}`;
    });
  }

  async createOrder(dto: CreateOrderDto, midtransOrderId: string) {
    const queueNumber = await this.getNextQueueNumber();

    return this.prisma.order.create({
      data: {
        queueNumber,
        customerName: dto.customerName,
        items: JSON.stringify(dto.items),
        subtotal: dto.subtotal,
        tax: dto.tax,
        total: dto.total,
        midtransOrderId,
        paymentStatus: PaymentStatus.PENDING,
        orderStatus: OrderStatus.NEW,
      },
    });
  }

  async findByMidtransOrderId(midtransOrderId: string) {
    const order = await this.prisma.order.findUnique({ where: { midtransOrderId } });
    if (!order) throw new NotFoundException('Order tidak ditemukan');
    return order;
  }

  async updatePaymentStatus(midtransOrderId: string, paymentStatus: PaymentStatus) {
    return this.prisma.order.update({
      where: { midtransOrderId },
      data: { paymentStatus },
    });
  }

  async updateOrderStatus(id: string, orderStatus: OrderStatus) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order tidak ditemukan');

    return this.prisma.order.update({
      where: { id },
      data: { orderStatus },
    });
  }

  // Dipakai monitor kasir: pesanan yang sudah dibayar dan belum selesai
  async listActiveOrders() {
    return this.prisma.order.findMany({
      where: {
        paymentStatus: PaymentStatus.PAID,
        orderStatus: { in: [OrderStatus.NEW, OrderStatus.IN_PROGRESS, OrderStatus.READY] },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  // Pesanan yang gagal/kedaluwarsa bayar — tidak masuk listActiveOrders
  // karena paymentStatus-nya bukan PAID, tapi tetap perlu terlihat kasir
  // untuk rekonsiliasi (misal pelanggan komplain "saya sudah bayar").
  async listFailedOrders() {
    return this.prisma.order.findMany({
      where: {
        paymentStatus: { in: [PaymentStatus.EXPIRED, PaymentStatus.PENDING] },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  // Riwayat pesanan yang sudah selesai HARI INI — supaya kasir bisa
  // cek ulang pesanan yang sudah hilang dari live queue.
  async listCompletedToday() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    return this.prisma.order.findMany({
      where: {
        orderStatus: { in: [OrderStatus.COMPLETED, OrderStatus.CANCELLED] },
        createdAt: { gte: startOfDay },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}