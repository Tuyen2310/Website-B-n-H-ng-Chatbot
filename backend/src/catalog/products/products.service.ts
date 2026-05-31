import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.ProductUncheckedCreateInput) {
    return this.prisma.product.create({ data });
  }

  async findAll(query: {
    category?: number;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    skip?: number;
    take?: number;
  }) {
    const { category, search, minPrice, maxPrice, sortBy, sortOrder = 'desc', skip = 0, take = 10 } = query;

    const where: Prisma.ProductWhereInput = {
      isDeleted: false,
      ...(category && { categoryId: category }),
      ...(search && {
        AND: search.split(' ').filter(s => s.length > 0).map(word => ({
          name: { contains: word, mode: 'insensitive' },
        })),
      }),
      ...( (minPrice || maxPrice) && {
        price: {
          ...(minPrice && { gte: minPrice }),
          ...(maxPrice && { lte: maxPrice }),
        },
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { category: true },
        skip,
        take,
        orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total };
  }

  async findOne(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { category: true, reviews: { include: { user: true } } },
    });
  }

  async getRecommendations(id: number, limit: number = 4) {
    // Dùng 1 query duy nhất thay vì 2 query tuần tự (tránh N+1 problem)
    const sourceProduct = await this.prisma.product.findUnique({
      where: { id },
      select: { categoryId: true }, // Chỉ lấy categoryId, không lấy toàn bộ fields
    });
    if (!sourceProduct) return [];
    
    return this.prisma.product.findMany({
      where: {
        categoryId: sourceProduct.categoryId,
        id: { not: id },
        isDeleted: false,
      },
      take: limit,
      orderBy: { soldCount: 'desc' }, // Gợi ý theo sản phẩm bán chạy thay vì mới nhất
      select: { // Chỉ lấy các fields cần thiết, không lấy toàn bộ (giảm data transfer)
        id: true,
        name: true,
        price: true,
        images: true,
        soldCount: true,
        category: { select: { id: true, name: true } },
      }
    });
  }

  async update(id: number, data: Prisma.ProductUncheckedUpdateInput) {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.product.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}
