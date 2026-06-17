import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/order.dto';
import { OrderStatus } from '@prisma/client';

import { PromotionsService } from '../promotions/promotions.service';

import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private promotionsService: PromotionsService,
    private notificationsService: NotificationsService,
    private mailService: MailService
  ) {}

  async create(userId: number | null, createOrderDto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsData: any[] = [];

      const settings = await tx.settings.findFirst();
      const now = new Date();
      const isFlashSaleActive = settings && settings.flashSaleStartTime && settings.flashSaleEndTime &&
        now >= new Date(settings.flashSaleStartTime) && now <= new Date(settings.flashSaleEndTime);

      for (const item of createOrderDto.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        
        if (!product || product.isDeleted) {
          throw new NotFoundException(`Product ${item.productId} not found`);
        }
        
        if (product.stock < item.quantity) {
          throw new BadRequestException(`Not enough stock for product ${product.name}`);
        }

        // Deduct stock
        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: item.quantity } },
        });

        const price = isFlashSaleActive && (product as any).isFlashSale && (product as any).flashSalePrice 
          ? (product as any).flashSalePrice 
          : product.price;

        totalAmount += price * item.quantity;

        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          price: price,
        });
      }

      // TÍNH TOÁN VOLUME DISCOUNT (Mua nhiều giảm nhiều)
      const totalItemsQuantity = createOrderDto.items.reduce((acc, item) => acc + item.quantity, 0);
      let volumeDiscountPercent = 0;
      if (totalItemsQuantity >= 4) volumeDiscountPercent = 0.15;
      else if (totalItemsQuantity === 3) volumeDiscountPercent = 0.10;
      else if (totalItemsQuantity === 2) volumeDiscountPercent = 0.05;

      const volumeDiscountAmount = totalAmount * volumeDiscountPercent;
      totalAmount = totalAmount - volumeDiscountAmount;

      // Calculate Shipping Fee
      let shippingFee = this.calculateShippingFee(createOrderDto.shippingProvince);
      let discountAmount = volumeDiscountAmount; // Include volume discount in discountAmount

      // Apply Voucher
      if (createOrderDto.voucherCode) {
        const promotion = await this.promotionsService.findByCode(createOrderDto.voucherCode);
        if (promotion && totalAmount >= (promotion.minOrderAmount || 0)) {
          if (promotion.type === 'FREESHIP') {
            discountAmount += shippingFee;
            shippingFee = 0;
          } else {
            let discount = 0;
            if (promotion.discountPercent) {
              discount = (totalAmount * promotion.discountPercent) / 100;
              if (promotion.maxDiscount && discount > promotion.maxDiscount) {
                discount = promotion.maxDiscount;
              }
            } else if (promotion.discountAmount) {
              discount = promotion.discountAmount;
            }
            discountAmount += discount;
          }
        }
      }

      let pointsUsed = 0;
      if (userId && createOrderDto.pointsUsed && createOrderDto.pointsUsed > 0) {
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (user && (user as any).points >= createOrderDto.pointsUsed) {
          pointsUsed = createOrderDto.pointsUsed;
          discountAmount += pointsUsed;
          
          await (tx.user.update as any)({
            where: { id: userId },
            data: { points: { decrement: pointsUsed } }
          });
        }
      }

      const finalTotal = Math.max(0, totalAmount + shippingFee - discountAmount);

      // Create Order
      const order = await tx.order.create({
        data: {
          userId: userId ?? undefined,
          guestName: createOrderDto.guestName,
          guestEmail: createOrderDto.guestEmail,
          guestPhone: createOrderDto.guestPhone,
          totalAmount: finalTotal,
          shippingFee,
          discountAmount,
          pointsUsed: (pointsUsed as any),
          paymentMethod: createOrderDto.paymentMethod,
          shippingAddress: createOrderDto.shippingAddress,
          items: {
            create: orderItemsData,
          },
        } as any,
        include: { items: { include: { product: true } } },
      });

      // Thông báo cho admin
      try {
        this.notificationsService.sendNewOrderAlert(order);
        
        // Find all admins to send email
        const admins = await tx.user.findMany({ where: { role: 'ADMIN' } });
        const adminEmails = admins.map(a => a.email);
        
        if (adminEmails.length > 0) {
          // Generate a simple token based on order ID and secret.
          const secret = process.env.JWT_SECRET || 'fallback_secret';
          const token = Buffer.from(`${order.id}:${secret}`).toString('base64');
          const encodedToken = encodeURIComponent(token);
          this.mailService.sendAdminNewOrderAlert(adminEmails, order, encodedToken);
        }
      } catch (e) {
        console.error('Lỗi khi gửi thông báo/email cho admin:', e);
      }

      // Gửi email cho user hoặc khách vãng lai
      try {
        if (userId) {
          const user = await tx.user.findUnique({ where: { id: userId } });
          if (user) {
            this.mailService.sendOrderConfirmation(user.email, order);
          }
        } else if (createOrderDto.guestEmail) {
          this.mailService.sendOrderConfirmation(createOrderDto.guestEmail, order);
        }
      } catch (e) {
        console.error('Lỗi khi gửi email:', e);
      }

      return order;
    });
  }

  async findAll(userId?: number, skip?: number, take?: number) {
    const where = userId ? { userId } : undefined;
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: { include: { product: true } },
          user: { select: { name: true, email: true, phone: true } }
        },
        skip: skip || 0,
        take: take || 50,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where })
    ]);
    return { items, total };
  }

  async findOne(id: number, userId?: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        user: { select: { name: true, email: true, phone: true, address: true } }
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (userId && order.userId !== userId) throw new BadRequestException('Unauthorized access to order');

    return order;
  }

  async updateStatus(id: number, status: OrderStatus) {
    const updated = await this.prisma.order.update({
      where: { id },
      data: { status },
    });
    
    try {
      if (updated.userId) {
        this.notificationsService.sendOrderStatusUpdate(updated.userId, updated.id, status);
        
        // Cấp điểm khi hoàn tất đơn hàng
        if (status === 'COMPLETED') {
          const pointsEarned = Math.floor(updated.totalAmount / 1000);
          if (pointsEarned > 0) {
            await (this.prisma.user.update as any)({
              where: { id: updated.userId },
              data: { points: { increment: pointsEarned } }
            });
          }
        }
      }
    } catch (e) {
      console.error('Lỗi khi gửi thông báo/cấp điểm:', e);
    }

    return updated;
  }

  async updatePaymentStatus(id: number, paymentStatus: boolean) {
    return this.prisma.order.update({
      where: { id },
      data: { paymentStatus },
    });
  }

  async cancelOrder(id: number, userId?: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!order) throw new NotFoundException('Order not found');
    if (userId && order.userId !== userId) throw new BadRequestException('Unauthorized');
    if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot cancel a completed or already cancelled order');
    }

    return this.prisma.$transaction(async (tx) => {
      // Restore stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        });
      }

      return tx.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELLED }
      });
    });
  }
  async completeOrder(id: number, userId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    if (order.userId !== userId) throw new BadRequestException('Bạn không có quyền thực hiện hành động này');
    if (order.status !== OrderStatus.SHIPPING && order.status !== OrderStatus.CONFIRMED) {
      throw new BadRequestException('Đơn hàng phải ở trạng thái đang giao hoặc đã xác nhận mới có thể hoàn thành.');
    }

    return this.prisma.order.update({
      where: { id },
      data: { 
        status: OrderStatus.COMPLETED,
        paymentStatus: true // Auto pay if not paid yet (e.g. COD)
      },
    });
  }

  private calculateShippingFee(province: string): number {
    if (!province) return 30000; // Default

    const p = province.toLowerCase();
    
    // Shop is in Hanoi
    if (p.includes('hà nội')) return 20000;

    // Northern/Neighboring provinces
    const northernProvinces = [
      'bắc ninh', 'hưng yên', 'vĩnh phúc', 'hải dương', 'hải phòng', 
      'thái nguyên', 'phú thọ', 'bắc giang', 'quảng ninh', 'hà nam', 
      'nam định', 'thái bình', 'ninh bình', 'hòa bình'
    ];
    if (northernProvinces.some(item => p.includes(item))) return 35000;

    // Central and Southern provinces (further away)
    return 50000;
  }

  async quickUpdateStatus(id: number, status: OrderStatus, token: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    const secret = process.env.JWT_SECRET || 'fallback_secret';
    const expectedToken = Buffer.from(`${id}:${secret}`).toString('base64');
    
    if (token !== expectedToken) {
      throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn.');
    }

    return this.updateStatus(id, status);
  }
}
