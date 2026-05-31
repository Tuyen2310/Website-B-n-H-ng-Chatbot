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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReviewsService = class ReviewsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, productId, rating, comment) {
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
            throw new common_1.BadRequestException('Bạn chỉ có thể đánh giá sản phẩm sau khi đã nhận được hàng (Trạng thái: Hoàn thành).');
        }
        const existingReview = await this.prisma.review.findFirst({
            where: { userId, productId },
        });
        if (existingReview) {
            throw new common_1.BadRequestException('Bạn đã đánh giá sản phẩm này rồi.');
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
    async findByProduct(productId) {
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
    async reply(reviewId, reply) {
        const review = await this.prisma.review.findUnique({
            where: { id: reviewId },
        });
        if (!review) {
            throw new common_1.NotFoundException('Không tìm thấy đánh giá.');
        }
        return this.prisma.review.update({
            where: { id: reviewId },
            data: {
                reply,
                repliedAt: new Date(),
            },
        });
    }
    async remove(id) {
        return this.prisma.review.delete({
            where: { id },
        });
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map