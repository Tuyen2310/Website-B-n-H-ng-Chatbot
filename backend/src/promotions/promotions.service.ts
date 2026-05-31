import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PromotionsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.PromotionCreateInput) {
    return this.prisma.promotion.create({ data });
  }

  async findAll(skip?: number, take?: number) {
    const [items, total] = await Promise.all([
      this.prisma.promotion.findMany({
        skip: skip || 0,
        take: take || 50,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.promotion.count()
    ]);
    return { items, total };
  }

  async findOne(id: number) {
    const promotion = await this.prisma.promotion.findUnique({ where: { id } });
    if (!promotion) throw new NotFoundException('Promotion not found');
    return promotion;
  }

  async findByCode(code: string) {
    const promotion = await this.prisma.promotion.findUnique({ where: { code } });
    if (!promotion) return null;
    
    // Check if valid
    const now = new Date();
    if (!promotion.isActive || now < promotion.startDate || now > promotion.endDate) {
      return null;
    }
    
    return promotion;
  }

  async update(id: number, data: Prisma.PromotionUpdateInput) {
    return this.prisma.promotion.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.promotion.delete({
      where: { id },
    });
  }
}
