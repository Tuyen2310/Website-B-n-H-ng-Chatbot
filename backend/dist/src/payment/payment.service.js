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
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const settings_service_1 = require("../settings/settings.service");
let PaymentService = class PaymentService {
    prisma;
    settingsService;
    constructor(prisma, settingsService) {
        this.prisma = prisma;
        this.settingsService = settingsService;
    }
    async createPaymentLink(orderId, method) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { items: { include: { product: true } } },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const settings = await this.settingsService.getSettings();
        if (!settings)
            throw new Error('System settings not initialized');
        const paymentInfo = settings.payment;
        const paymentId = `VNPAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const mockPaymentUrl = `/payment/gateway?orderId=${orderId}&paymentId=${paymentId}&method=${method}&amount=${order.totalAmount}`;
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
    async verifyPayment(paymentId) {
        const order = await this.prisma.order.findUnique({
            where: { paymentId },
        });
        if (!order)
            throw new common_1.NotFoundException('Payment record not found');
        return {
            status: order.paymentStatus ? 'PAID' : 'PENDING',
            orderId: order.id,
            amount: order.totalAmount,
        };
    }
    async handleWebhook(payload) {
        const { paymentId, status } = payload;
        if (status === 'SUCCESS') {
            await this.prisma.order.update({
                where: { paymentId },
                data: {
                    paymentStatus: true,
                    status: 'CONFIRMED',
                },
            });
        }
        return { success: true };
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        settings_service_1.SettingsService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map