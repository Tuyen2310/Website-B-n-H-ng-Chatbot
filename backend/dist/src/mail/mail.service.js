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
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const mailer_1 = require("@nestjs-modules/mailer");
let MailService = MailService_1 = class MailService {
    mailerService;
    logger = new common_1.Logger(MailService_1.name);
    constructor(mailerService) {
        this.mailerService = mailerService;
    }
    async sendOrderConfirmation(email, orderDetails) {
        try {
            const itemsHtml = (orderDetails.items || []).map((item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.product?.name || 'Sản phẩm'}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toLocaleString()}đ</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${(item.price * item.quantity).toLocaleString()}đ</td>
        </tr>
      `).join('');
            const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #2563eb; color: #fff; padding: 20px; text-align: center;">
            <h2 style="margin: 0; font-size: 24px;">HÓA ĐƠN ĐIỆN TỬ</h2>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Cảm ơn bạn đã mua sắm tại SmartShop!</p>
          </div>
          
          <div style="padding: 20px;">
            <div style="margin-bottom: 20px; display: flex; justify-content: space-between;">
              <div>
                <strong>Mã đơn hàng:</strong> #${orderDetails.id}<br>
                <strong>Ngày đặt:</strong> ${new Date(orderDetails.createdAt || Date.now()).toLocaleDateString('vi-VN')}
              </div>
              <div style="text-align: right;">
                <strong>Phương thức:</strong><br>
                ${orderDetails.paymentMethod}
              </div>
            </div>

            <div style="margin-bottom: 20px;">
              <strong>Địa chỉ giao hàng:</strong><br>
              ${orderDetails.shippingAddress}
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background-color: #f8fafc; text-align: left;">
                  <th style="padding: 12px; border-bottom: 2px solid #cbd5e1;">Sản phẩm</th>
                  <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; text-align: center;">SL</th>
                  <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; text-align: right;">Đơn giá</th>
                  <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; text-align: right;">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="width: 100%; text-align: right;">
              <table style="width: 250px; border-collapse: collapse; margin-left: auto;">
                <tr>
                  <td style="padding: 8px 0; text-align: left;">Tạm tính:</td>
                  <td style="padding: 8px 0; text-align: right;">${(orderDetails.totalAmount - orderDetails.shippingFee + orderDetails.discountAmount).toLocaleString()}đ</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; text-align: left;">Phí vận chuyển:</td>
                  <td style="padding: 8px 0; text-align: right;">${orderDetails.shippingFee.toLocaleString()}đ</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: left;">Giảm giá:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right; color: #ef4444;">-${orderDetails.discountAmount.toLocaleString()}đ</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; font-weight: bold; font-size: 18px; text-align: left;">Tổng cộng:</td>
                  <td style="padding: 12px 0; font-weight: bold; font-size: 18px; text-align: right; color: #2563eb;">${orderDetails.totalAmount.toLocaleString()}đ</td>
                </tr>
              </table>
            </div>
            
            <div style="margin-top: 30px; text-align: center; color: #64748b; font-size: 14px;">
              <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email support@smartshop.com</p>
            </div>
          </div>
        </div>
      `;
            await this.mailerService.sendMail({
                to: email,
                subject: `Hóa đơn điện tử - Đơn hàng #${orderDetails.id}`,
                html: html,
            });
            this.logger.log(`Order confirmation email sent to ${email}`);
        }
        catch (error) {
            this.logger.error(`Failed to send email to ${email}`, error.stack);
        }
    }
    async sendWelcomeEmail(email, name) {
        try {
            await this.mailerService.sendMail({
                to: email,
                subject: `Chào mừng đến với SmartShop!`,
                text: `Xin chào ${name}, cảm ơn bạn đã đăng ký tài khoản tại SmartShop.`,
                html: `
          <h3>Xin chào ${name},</h3>
          <p>Cảm ơn bạn đã đăng ký tài khoản tại SmartShop. Chúc bạn có những trải nghiệm mua sắm tuyệt vời!</p>
        `,
            });
            this.logger.log(`Welcome email sent to ${email}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to send welcome email to ${email}`, error);
            return false;
        }
    }
    async sendOtpEmail(email, otpCode, name) {
        try {
            const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #ddd; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="background-color: #2563eb; color: #fff; padding: 24px; text-align: center;">
            <h2 style="margin: 0; font-size: 24px; letter-spacing: 1px;">MÃ XÁC THỰC OTP</h2>
          </div>
          
          <div style="padding: 32px 24px; text-align: center;">
            <p style="font-size: 16px; margin-bottom: 24px;">Xin chào <strong>${name}</strong>,</p>
            <p style="font-size: 16px; color: #666; margin-bottom: 32px;">Bạn đã yêu cầu gửi mã xác thực. Dưới đây là mã OTP gồm 6 chữ số của bạn:</p>
            
            <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 16px; margin-bottom: 32px; display: inline-block;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb;">${otpCode}</span>
            </div>
            
            <p style="font-size: 14px; color: #ef4444; margin-bottom: 16px;"><strong>Lưu ý:</strong> Mã này sẽ hết hạn sau 5 phút.</p>
            <p style="font-size: 14px; color: #666;">Vui lòng không chia sẻ mã này cho bất kỳ ai để bảo mật tài khoản.</p>
          </div>
          
          <div style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #eee;">
            <p style="margin: 0; font-size: 12px; color: #94a3b8;">&copy; 2026 SmartShop. All rights reserved.</p>
          </div>
        </div>
      `;
            await this.mailerService.sendMail({
                to: email,
                subject: `[SmartShop] Mã xác thực OTP của bạn là: ${otpCode}`,
                html: html,
            });
            this.logger.log(`OTP email sent successfully to ${email}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to send OTP email to ${email}`, error);
            return false;
        }
    }
    async sendAdminNewOrderAlert(adminEmails, orderDetails, token) {
        try {
            const backendUrl = process.env.API_URL || 'http://localhost:3001';
            const quickActionBase = `${backendUrl}/api/orders/quick-status?id=${orderDetails.id}&token=${token}&status=`;
            const confirmLink = quickActionBase + 'CONFIRMED';
            const shippingLink = quickActionBase + 'SHIPPING';
            const cancelLink = quickActionBase + 'CANCELLED';
            await this.mailerService.sendMail({
                to: adminEmails,
                subject: `[CẢNH BÁO] Có đơn hàng mới #${orderDetails.id} - ${orderDetails.totalAmount}đ`,
                html: `
          <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
            <h2 style="color: #2563eb;">Có đơn hàng mới trên SmartShop!</h2>
            <p>Khách hàng <strong>${orderDetails.user?.name || 'Khách Vãng Lai'}</strong> vừa tạo đơn hàng mới.</p>
            <ul>
              <li><strong>Mã Đơn:</strong> #${orderDetails.id}</li>
              <li><strong>Tổng Tiền:</strong> ${orderDetails.totalAmount.toLocaleString()}đ</li>
              <li><strong>Phương thức:</strong> ${orderDetails.paymentMethod}</li>
            </ul>
            <hr />
            <h3>Thay đổi trạng thái nhanh:</h3>
            <p style="margin-top: 15px;">
              <a href="${confirmLink}" style="padding: 10px 20px; background: #3b82f6; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">Xác Nhận Đơn</a>
              <a href="${shippingLink}" style="padding: 10px 20px; background: #8b5cf6; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">Bắt Đầu Giao</a>
              <a href="${cancelLink}" style="padding: 10px 20px; background: #ef4444; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">Hủy Đơn</a>
            </p>
            <p style="font-size: 12px; color: #999; margin-top: 30px;">
              *Các liên kết trên có hiệu lực thực thi ngay lập tức. Hãy cân nhắc trước khi click.
            </p>
          </div>
        `,
            });
            this.logger.log(`New order alert sent to admins: ${adminEmails.join(', ')}`);
        }
        catch (error) {
            this.logger.error(`Failed to send admin order alert`, error.stack);
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mailer_1.MailerService])
], MailService);
//# sourceMappingURL=mail.service.js.map