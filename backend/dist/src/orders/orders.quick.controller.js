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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersQuickController = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("./orders.service");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const order_dto_1 = require("./dto/order.dto");
let OrdersQuickController = class OrdersQuickController {
    ordersService;
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    createGuestOrder(createOrderDto) {
        if (!createOrderDto.guestEmail || !createOrderDto.guestName) {
            throw new common_1.BadRequestException('Guest orders require guestName and guestEmail');
        }
        return this.ordersService.create(null, createOrderDto);
    }
    async updateStatusQuick(id, status, token, res) {
        if (!id || !status || !token) {
            throw new common_1.BadRequestException('Missing required parameters');
        }
        try {
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
        }
        catch (error) {
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
};
exports.OrdersQuickController = OrdersQuickController;
__decorate([
    (0, common_1.Post)('guest'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new order as a Guest' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_dto_1.CreateOrderDto]),
    __metadata("design:returntype", void 0)
], OrdersQuickController.prototype, "createGuestOrder", null);
__decorate([
    (0, common_1.Get)('quick-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Quick update order status via Email Link' }),
    __param(0, (0, common_1.Query)('id')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('token')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], OrdersQuickController.prototype, "updateStatusQuick", null);
exports.OrdersQuickController = OrdersQuickController = __decorate([
    (0, swagger_1.ApiTags)('orders'),
    (0, common_1.Controller)('orders'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersQuickController);
//# sourceMappingURL=orders.quick.controller.js.map