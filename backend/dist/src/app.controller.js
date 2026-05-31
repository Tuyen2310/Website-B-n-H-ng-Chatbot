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
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("./app.service");
const prisma_service_1 = require("./prisma/prisma.service");
let AppController = class AppController {
    appService;
    prisma;
    constructor(appService, prisma) {
        this.appService = appService;
        this.prisma = prisma;
    }
    getHello() {
        return this.appService.getHello();
    }
    async quickStatus(id, token, status, res) {
        if (!id || !token || !status) {
            throw new common_1.BadRequestException('Thiếu tham số');
        }
        const orderId = parseInt(id);
        const secret = process.env.JWT_SECRET || 'fallback_secret';
        const expectedToken = Buffer.from(`${orderId}:${secret}`).toString('base64');
        if (token !== expectedToken) {
            throw new common_1.BadRequestException('Token không hợp lệ');
        }
        await this.prisma.order.update({
            where: { id: orderId },
            data: { status: status },
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
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
__decorate([
    (0, common_1.Get)('orders/quick-status'),
    __param(0, (0, common_1.Query)('id')),
    __param(1, (0, common_1.Query)('token')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "quickStatus", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService,
        prisma_service_1.PrismaService])
], AppController);
//# sourceMappingURL=app.controller.js.map