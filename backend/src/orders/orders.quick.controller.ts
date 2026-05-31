import { Controller, Get, Post, Body, Query, Res, BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';
import { OrderStatus } from '@prisma/client';
import { CreateOrderDto } from './dto/order.dto';

@ApiTags('orders')
@Controller('orders')
export class OrdersQuickController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('guest')
  @ApiOperation({ summary: 'Create a new order as a Guest' })
  createGuestOrder(@Body() createOrderDto: CreateOrderDto) {
    if (!createOrderDto.guestEmail || !createOrderDto.guestName) {
      throw new BadRequestException('Guest orders require guestName and guestEmail');
    }
    return this.ordersService.create(null, createOrderDto);
  }

  @Get('quick-status')
  @ApiOperation({ summary: 'Quick update order status via Email Link' })
  async updateStatusQuick(
    @Query('id') id: string,
    @Query('status') status: OrderStatus,
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    if (!id || !status || !token) {
      throw new BadRequestException('Missing required parameters');
    }

    try {
      // Validate token internally in service
      await this.ordersService.quickUpdateStatus(Number(id), status, token);
      
      return res.send(`
        <html>
          <head>
            <title>Cập nhật trạng thái thành công</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f3f4f6; margin: 0; }
              .container { background-color: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
              h1 { color: #10b981; margin-bottom: 10px; }
              p { color: #6b7280; line-height: 1.5; }
              .icon { font-size: 48px; color: #10b981; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">✓</div>
              <h1>Cập nhật thành công!</h1>
              <p>Trạng thái đơn hàng #${id} đã được thay đổi thành <strong>${status}</strong>.</p>
              <p>Bạn có thể đóng tab này lại.</p>
            </div>
          </body>
        </html>
      `);
    } catch (error: any) {
      return res.send(`
        <html>
          <head>
            <title>Lỗi cập nhật trạng thái</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f3f4f6; margin: 0; }
              .container { background-color: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
              h1 { color: #ef4444; margin-bottom: 10px; }
              p { color: #6b7280; line-height: 1.5; }
              .icon { font-size: 48px; color: #ef4444; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">✗</div>
              <h1>Cập nhật thất bại</h1>
              <p>${error.message || 'Token không hợp lệ hoặc đã hết hạn.'}</p>
            </div>
          </body>
        </html>
      `);
    }
  }
}
