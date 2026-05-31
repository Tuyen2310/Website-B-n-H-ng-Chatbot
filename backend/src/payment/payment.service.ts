import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private settingsService: SettingsService
  ) {}

  async createPaymentLink(orderId: number, method: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });

    if (!order) throw new NotFoundException('Order not found');

    const settings = await this.settingsService.getSettings();
    if (!settings) throw new Error('System settings not initialized');
    const paymentInfo = settings.payment;

    // Simulate VNPay gateway link generation
    const paymentId = `VNPAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const frontendUrl = process.env.FRONTEND_URL || 'http://smartshop.local:3000';
    const mockPaymentUrl = `${frontendUrl}/payment/gateway?orderId=${orderId}&paymentId=${paymentId}&method=${method}&amount=${order.totalAmount}`;

    // Store payment info in DB
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentId,
        paymentUrl: mockPaymentUrl,
      },
    });

    return {
      paymentUrl: mockPaymentUrl,
      paymentId,
    };
  }

  async verifyPayment(paymentId: string) {
    const order = await this.prisma.order.findUnique({
      where: { paymentId },
    });

    if (!order) throw new NotFoundException('Payment record not found');

    // In a real implementation, you would call the gateway API (e.g., PayOS.getPaymentLinkInformation)
    // For mock, we check a global mock state or just return current status
    return {
      status: order.paymentStatus ? 'PAID' : 'PENDING',
      orderId: order.id,
      amount: order.totalAmount,
    };
  }

  async handleWebhook(payload: any) {
    // This would be called by the real gateway (PayOS/MoMo)
    // For mock, we'll manually trigger this from our mock gateway page
    const { paymentId, status } = payload;

    if (status === 'SUCCESS') {
      await this.prisma.order.update({
        where: { paymentId },
        data: {
          paymentStatus: true,
          status: 'CONFIRMED', // Automatically confirm order on payment
        },
      });
    }

    return { success: true };
  }
}
