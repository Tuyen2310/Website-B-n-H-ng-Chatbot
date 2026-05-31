import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService
  ) {}

  async create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  async createByAdmin(data: { name: string; email: string; password: string; phone?: string; address?: string; role?: Role }) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictException('Email đã tồn tại trong hệ thống.');
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const { password, ...rest } = await this.prisma.user.create({
      data: { ...data, password: hashedPassword },
    });
    return rest;
  }

  async findAll(skip?: number, take?: number) {
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

  async findOneByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findOneById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: number, data: { name?: string; phone?: string; address?: string; role?: Role; isBlocked?: boolean }) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async sendOtp(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng.');

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await this.prisma.user.update({
      where: { id: userId },
      data: { otpCode, otpExpires } as any, // ép kiểu để tránh lỗi Prisma chưa generate
    });

    const sent = await this.mailService.sendOtpEmail(user.email, otpCode, user.name);
    if (!sent) {
      throw new ConflictException('Không thể gửi email OTP, vui lòng thử lại.');
    }
    return { message: 'Mã OTP đã được gửi đến email của bạn' };
  }

  async changePassword(userId: number, data: { oldPassword?: string; newPassword: string; otpCode?: string }) {
    const user: any = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng.');

    if (!data.otpCode || data.otpCode !== user.otpCode || !user.otpExpires || user.otpExpires < new Date()) {
      throw new UnauthorizedException('Mã OTP không hợp lệ hoặc đã hết hạn.');
    }

    if (data.oldPassword) {
      if (!user.password) throw new UnauthorizedException('Tài khoản này đăng nhập bằng Google, không có mật khẩu để thay đổi.');
      const isMatch = await bcrypt.compare(data.oldPassword, user.password);
      if (!isMatch) throw new UnauthorizedException('Mật khẩu cũ không chính xác.');
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { 
        password: hashedPassword,
        otpCode: null,
        otpExpires: null
      } as any,
    });
    return { message: 'Đổi mật khẩu thành công' };
  }

  async getWishlist(userId: number) {
    const list = await (this.prisma as any).wishlist.findMany({
      where: { userId },
      include: { product: true }
    });
    return list.map(item => item.product);
  }

  async toggleWishlist(userId: number, productId: number) {
    const existing = await (this.prisma as any).wishlist.findUnique({
      where: { userId_productId: { userId, productId } }
    });

    if (existing) {
      await (this.prisma as any).wishlist.delete({
        where: { id: existing.id }
      });
      return { added: false };
    } else {
      await (this.prisma as any).wishlist.create({
        data: { userId, productId }
      });
      return { added: true };
    }
  }
}
