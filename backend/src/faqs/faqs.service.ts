import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class FaqsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.FAQCreateInput) {
    return this.prisma.fAQ.create({ data });
  }

  async findAll() {
    return this.prisma.fAQ.findMany({
      where: { isDeleted: false },
      include: { product: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: number) {
    return this.prisma.fAQ.findUnique({
      where: { id },
    });
  }

  async update(id: number, data: Prisma.FAQUpdateInput) {
    return this.prisma.fAQ.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.fAQ.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}
