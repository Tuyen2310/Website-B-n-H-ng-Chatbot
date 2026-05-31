import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(private readonly gateway: NotificationsGateway) {}

  sendNewOrderAlert(order: any) {
    // Thông báo cho toàn bộ máy khách đang ở trang Admin
    this.gateway.notifyAdmins('new_order', {
      message: `Có đơn hàng mới #${order.id} trị giá ${order.totalAmount}đ`,
      orderId: order.id,
      amount: order.totalAmount,
      time: new Date(),
    });
  }

  sendOrderStatusUpdate(userId: number, orderId: number, status: string) {
    // Thông báo cho user về đơn hàng của họ
    this.gateway.notifyUser(userId, 'order_status_update', {
      message: `Đơn hàng #${orderId} của bạn đã chuyển sang trạng thái: ${status}`,
      orderId,
      status,
    });
  }
}
