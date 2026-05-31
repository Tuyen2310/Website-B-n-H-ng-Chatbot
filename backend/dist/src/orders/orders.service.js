"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const promotions_service_1 = require("../promotions/promotions.service");
const notifications_service_1 = require("../notifications/notifications.service");
const mail_service_1 = require("../mail/mail.service");
let OrdersService = class OrdersService {
    prisma;
    promotionsService;
    notificationsService;
    mailService;
    constructor(prisma, promotionsService, notificationsService, mailService) {
        this.prisma = prisma;
        this.promotionsService = promotionsService;
        this.notificationsService = notificationsService;
        this.mailService = mailService;
    }
    async create(userId, createOrderDto) {
        return this.prisma.$transaction(async (tx) => {
            let totalAmount = 0;
            const orderItemsData = [];
            for (const item of createOrderDto.items) {
                const product = await tx.product.findUnique({ where: { id: item.productId } });
                if (!product || product.isDeleted) {
                    throw new common_1.NotFoundException(`Product ${item.productId} not found`);
                }
                if (product.stock < item.quantity) {
                    throw new common_1.BadRequestException(`Not enough stock for product ${product.name}`);
                }
                await tx.product.update({
                    where: { id: product.id },
                    data: { stock: { decrement: item.quantity } },
                });
                const price = product.price;
                totalAmount += price * item.quantity;
                orderItemsData.push({
                    productId: product.id,
                    quantity: item.quantity,
                    price: price,
                });
            }
            let shippingFee = this.calculateShippingFee(createOrderDto.shippingProvince);
            let discountAmount = 0;
            if (createOrderDto.voucherCode) {
                const promotion = await this.promotionsService.findByCode(createOrderDto.voucherCode);
                if (promotion && totalAmount >= (promotion.minOrderAmount || 0)) {
                    if (promotion.type === 'FREESHIP') {
                        discountAmount += shippingFee;
                        shippingFee = 0;
                    }
                    else {
                        let discount = 0;
                        if (promotion.discountPercent) {
                            discount = (totalAmount * promotion.discountPercent) / 100;
                            if (promotion.maxDiscount && discount > promotion.maxDiscount) {
                                discount = promotion.maxDiscount;
                            }
                        }
                        else if (promotion.discountAmount) {
                            discount = promotion.discountAmount;
                        }
                        discountAmount += discount;
                    }
                }
            }
            let pointsUsed = 0;
            if (userId && createOrderDto.pointsUsed && createOrderDto.pointsUsed > 0) {
                const user = await tx.user.findUnique({ where: { id: userId } });
                if (user && user.points >= createOrderDto.pointsUsed) {
                    pointsUsed = createOrderDto.pointsUsed;
                    discountAmount += pointsUsed;
                    await tx.user.update({
                        where: { id: userId },
                        data: { points: { decrement: pointsUsed } }
                    });
                }
            }
            const finalTotal = Math.max(0, totalAmount + shippingFee - discountAmount);
            const order = await tx.order.create({
                data: {
                    userId: userId ?? undefined,
                    guestName: createOrderDto.guestName,
                    guestEmail: createOrderDto.guestEmail,
                    guestPhone: createOrderDto.guestPhone,
                    totalAmount: finalTotal,
                    shippingFee,
                    discountAmount,
                    pointsUsed: pointsUsed,
                    paymentMethod: createOrderDto.paymentMethod,
                    shippingAddress: createOrderDto.shippingAddress,
                    items: {
                        create: orderItemsData,
                    },
                },
                include: { items: { include: { product: true } } },
            });
            try {
                this.notificationsService.sendNewOrderAlert(order);
                const admins = await tx.user.findMany({ where: { role: 'ADMIN' } });
                const adminEmails = admins.map(a => a.email);
                if (adminEmails.length > 0) {
                    const secret = process.env.JWT_SECRET || 'fallback_secret';
                    const token = Buffer.from(`${order.id}:${secret}`).toString('base64');
                    const encodedToken = encodeURIComponent(token);
                    this.mailService.sendAdminNewOrderAlert(adminEmails, order, encodedToken);
                }
            }
            catch (e) {
                console.error('Lỗi khi gửi thông báo/email cho admin:', e);
            }
            try {
                if (userId) {
                    const user = await tx.user.findUnique({ where: { id: userId } });
                    if (user) {
                        this.mailService.sendOrderConfirmation(user.email, order);
                    }
                }
                else if (createOrderDto.guestEmail) {
                    this.mailService.sendOrderConfirmation(createOrderDto.guestEmail, order);
                }
            }
            catch (e) {
                console.error('Lỗi khi gửi email:', e);
            }
            return order;
        });
    }
    async findAll(userId, skip, take) {
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
    async findOne(id, userId) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                items: { include: { product: true } },
                user: { select: { name: true, email: true, phone: true, address: true } }
            },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (userId && order.userId !== userId)
            throw new common_1.BadRequestException('Unauthorized access to order');
        return order;
    }
    async updateStatus(id, status) {
        const updated = await this.prisma.order.update({
            where: { id },
            data: { status },
        });
        try {
            if (updated.userId) {
                this.notificationsService.sendOrderStatusUpdate(updated.userId, updated.id, status);
                if (status === 'COMPLETED') {
                    const pointsEarned = Math.floor(updated.totalAmount / 1000);
                    if (pointsEarned > 0) {
                        await this.prisma.user.update({
                            where: { id: updated.userId },
                            data: { points: { increment: pointsEarned } }
                        });
                    }
                }
            }
        }
        catch (e) {
            console.error('Lỗi khi gửi thông báo/cấp điểm:', e);
        }
        return updated;
    }
    async updatePaymentStatus(id, paymentStatus) {
        return this.prisma.order.update({
            where: { id },
            data: { paymentStatus },
        });
    }
    async cancelOrder(id, userId) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: { items: true }
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (userId && order.userId !== userId)
            throw new common_1.BadRequestException('Unauthorized');
        if (order.status === client_1.OrderStatus.COMPLETED || order.status === client_1.OrderStatus.CANCELLED) {
            throw new common_1.BadRequestException('Cannot cancel a completed or already cancelled order');
        }
        return this.prisma.$transaction(async (tx) => {
            for (const item of order.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { increment: item.quantity } }
                });
            }
            return tx.order.update({
                where: { id },
                data: { status: client_1.OrderStatus.CANCELLED }
            });
        });
    }
    async completeOrder(id, userId) {
        const order = await this.prisma.order.findUnique({
            where: { id },
        });
        if (!order)
            throw new common_1.NotFoundException('Không tìm thấy đơn hàng');
        if (order.userId !== userId)
            throw new common_1.BadRequestException('Bạn không có quyền thực hiện hành động này');
        if (order.status !== client_1.OrderStatus.SHIPPING && order.status !== client_1.OrderStatus.CONFIRMED) {
            throw new common_1.BadRequestException('Đơn hàng phải ở trạng thái đang giao hoặc đã xác nhận mới có thể hoàn thành.');
        }
        return this.prisma.order.update({
            where: { id },
            data: {
                status: client_1.OrderStatus.COMPLETED,
                paymentStatus: true
            },
        });
    }
    calculateShippingFee(province) {
        if (!province)
            return 30000;
        const p = province.toLowerCase();
        if (p.includes('hà nội'))
            return 20000;
        const northernProvinces = [
            'bắc ninh', 'hưng yên', 'vĩnh phúc', 'hải dương', 'hải phòng',
            'thái nguyên', 'phú thọ', 'bắc giang', 'quảng ninh', 'hà nam',
            'nam định', 'thái bình', 'ninh bình', 'hòa bình'
        ];
        if (northernProvinces.some(item => p.includes(item)))
            return 35000;
        return 50000;
    }
    async quickUpdateStatus(id, status, token) {
        const order = await this.prisma.order.findUnique({ where: { id } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const secret = process.env.JWT_SECRET || 'fallback_secret';
        const expectedToken = Buffer.from(`${id}:${secret}`).toString('base64');
        if (token !== expectedToken) {
            throw new common_1.BadRequestException('Token không hợp lệ hoặc đã hết hạn.');
        }
        return this.updateStatus(id, status);
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        promotions_service_1.PromotionsService,
        notifications_service_1.NotificationsService,
        mail_service_1.MailService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map