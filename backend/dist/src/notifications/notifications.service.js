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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const notifications_gateway_1 = require("./notifications.gateway");
let NotificationsService = class NotificationsService {
    gateway;
    constructor(gateway) {
        this.gateway = gateway;
    }
    sendNewOrderAlert(order) {
        this.gateway.notifyAdmins('new_order', {
            message: `Có đơn hàng mới #${order.id} trị giá ${order.totalAmount}đ`,
            orderId: order.id,
            amount: order.totalAmount,
            time: new Date(),
        });
    }
    sendOrderStatusUpdate(userId, orderId, status) {
        this.gateway.notifyUser(userId, 'order_status_update', {
            message: `Đơn hàng #${orderId} của bạn đã chuyển sang trạng thái: ${status}`,
            orderId,
            status,
        });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notifications_gateway_1.NotificationsGateway])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map