import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, productId: number, rating: number, comment?: string) {
    // Check if user has bought this product
    // We allow reviews if the order is COMPLETED
    const order = await this.prisma.order.findFirst({
      where: {
        userId,
        status: 'COMPLETED',
        items: {
          some: { productId },
        },
      },
    });

    if (!order) {
      throw new BadRequestException('Bạn chỉ có thể đánh giá sản phẩm sau khi đã nhận được hàng (Trạng thái: Hoàn thành).');
    }

    // Check if already reviewed
    const existingReview = await this.prisma.review.findFirst({
      where: { userId, productId },
    });

    if (existingReview) {
      throw new BadRequestException('Bạn đã đánh giá sản phẩm này rồi.');
    }

    return this.prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        comment,
      },
      include: {
        user: { select: { name: true } }
      }
    });
  }

  async findByProduct(productId: number) {
    return this.prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async reply(reviewId: number, reply: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Không tìm thấy đánh giá.');
    }

    return this.prisma.review.update({
      where: { id: reviewId },
      data: {
        reply,
        repliedAt: new Date(),
      },
    });
  }

  async remove(id: number) {
    return this.prisma.review.delete({
      where: { id },
    });
  }
}
