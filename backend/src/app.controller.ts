import { Controller, Get, Query, Res, BadRequestException } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('orders/quick-status')
  async quickStatus(
    @Query('id') id: string,
    @Query('token') token: string,
    @Query('status') status: string,
    @Res() res: any,
  ) {
    if (!id || !token || !status) {
      throw new BadRequestException('Thiếu tham số');
    }

    const orderId = parseInt(id);
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    const expectedToken = Buffer.from(`${orderId}:${secret}`).toString('base64');

    if (token !== expectedToken) {
      throw new BadRequestException('Token không hợp lệ');
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: status as any },
    });

    return res.send(`
      <html>
        <head><meta charset="utf-8" /></head>
        <body style="display:flex; justify-content:center; align-items:center; height:100vh; font-family:sans-serif; background:#f8fafc;">
          <div style="text-align:center; background:white; padding:40px; border-radius:20px; box-shadow:0 10px 30px rgba(0,0,0,0.1);">
            <h1 style="color:#2563eb; margin-bottom:10px;">Cập nhật thành công!</h1>
            <p style="color:#64748b; font-size:16px;">Đơn hàng <strong>#${orderId}</strong> đã được chuyển sang trạng thái <strong>${status}</strong></p>
            <script>setTimeout(() => window.close(), 3000);</script>
          </div>
        </body>
      </html>
    `);
  }
}
