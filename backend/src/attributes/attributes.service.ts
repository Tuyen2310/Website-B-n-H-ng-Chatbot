import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttributesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.productAttribute.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const attr = await this.prisma.productAttribute.findUnique({
      where: { id },
    });
    if (!attr) throw new NotFoundException('Không tìm thấy thuộc tính');
    return attr;
  }

  async create(data: { name: string; values: string[] }) {
    try {
      return await this.prisma.productAttribute.create({
        data,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Tên thuộc tính đã tồn tại');
      }
      throw error;
    }
  }

  async update(id: number, data: { name?: string; values?: string[] }) {
    try {
      return await this.prisma.productAttribute.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Tên thuộc tính đã tồn tại');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('Không tìm thấy thuộc tính để cập nhật');
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.productAttribute.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Không tìm thấy thuộc tính để xóa');
      }
      throw error;
    }
  }
}
