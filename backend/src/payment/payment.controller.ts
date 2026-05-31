import { Controller, Post, Body, Get, Query, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-link')
  async createLink(@Body() data: { orderId: number; method: string }) {
    return this.paymentService.createPaymentLink(data.orderId, data.method);
  }

  @Get('verify/:paymentId')
  async verify(@Param('paymentId') paymentId: string) {
    return this.paymentService.verifyPayment(paymentId);
  }

  @Post('webhook')
  async webhook(@Body() payload: any) {
    return this.paymentService.handleWebhook(payload);
  }
}
