"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const mail_service_1 = require("../mail/mail.service");
let UsersService = class UsersService {
    prisma;
    mailService;
    constructor(prisma, mailService) {
        this.prisma = prisma;
        this.mailService = mailService;
    }
    async create(data) {
        return this.prisma.user.create({ data });
    }
    async createByAdmin(data) {
        const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
        if (existing)
            throw new common_1.ConflictException('Email đã tồn tại trong hệ thống.');
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const { password, ...rest } = await this.prisma.user.create({
            data: { ...data, password: hashedPassword },
        });
        return rest;
    }
    async findAll(skip, take) {
        const [items, total] = await Promise.all([
            this.prisma.user.findMany({
                skip: skip || 0,
                take: take || 50,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count(),
        ]);
        return { items, total };
    }
    async findOneByEmail(email) {
        return this.prisma.user.findUnique({ where: { email } });
    }
    async findOneById(id) {
        return this.prisma.user.findUnique({ where: { id } });
    }
    async update(id, data) {
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }
    async remove(id) {
        return this.prisma.user.delete({
            where: { id },
        });
    }
    async sendOtp(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('Không tìm thấy người dùng.');
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000);
        await this.prisma.user.update({
            where: { id: userId },
            data: { otpCode, otpExpires },
        });
        const sent = await this.mailService.sendOtpEmail(user.email, otpCode, user.name);
        if (!sent) {
            throw new common_1.ConflictException('Không thể gửi email OTP, vui lòng thử lại.');
        }
        return { message: 'Mã OTP đã được gửi đến email của bạn' };
    }
    async changePassword(userId, data) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('Không tìm thấy người dùng.');
        if (!data.otpCode || data.otpCode !== user.otpCode || !user.otpExpires || user.otpExpires < new Date()) {
            throw new common_1.UnauthorizedException('Mã OTP không hợp lệ hoặc đã hết hạn.');
        }
        if (data.oldPassword) {
            if (!user.password)
                throw new common_1.UnauthorizedException('Tài khoản này đăng nhập bằng Google, không có mật khẩu để thay đổi.');
            const isMatch = await bcrypt.compare(data.oldPassword, user.password);
            if (!isMatch)
                throw new common_1.UnauthorizedException('Mật khẩu cũ không chính xác.');
        }
        const hashedPassword = await bcrypt.hash(data.newPassword, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
                otpCode: null,
                otpExpires: null
            },
        });
        return { message: 'Đổi mật khẩu thành công' };
    }
    async getWishlist(userId) {
        const list = await this.prisma.wishlist.findMany({
            where: { userId },
            include: { product: true }
        });
        return list.map(item => item.product);
    }
    async toggleWishlist(userId, productId) {
        const existing = await this.prisma.wishlist.findUnique({
            where: { userId_productId: { userId, productId } }
        });
        if (existing) {
            await this.prisma.wishlist.delete({
                where: { id: existing.id }
            });
            return { added: false };
        }
        else {
            await this.prisma.wishlist.create({
                data: { userId, productId }
            });
            return { added: true };
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService])
], UsersService);
//# sourceMappingURL=users.service.js.map