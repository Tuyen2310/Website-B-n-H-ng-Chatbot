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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ProductsService = class ProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.product.create({ data });
    }
    async findAll(query) {
        const { category, search, minPrice, maxPrice, sortBy, sortOrder = 'desc', skip = 0, take = 10 } = query;
        const where = {
            isDeleted: false,
            ...(category && { categoryId: category }),
            ...(search && {
                AND: search.split(' ').filter(s => s.length > 0).map(word => ({
                    name: { contains: word, mode: 'insensitive' },
                })),
            }),
            ...((minPrice || maxPrice) && {
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
    async findOne(id) {
        return this.prisma.product.findUnique({
            where: { id },
            include: { category: true, reviews: { include: { user: true } } },
        });
    }
    async getRecommendations(id, limit = 4) {
        const sourceProduct = await this.prisma.product.findUnique({
            where: { id },
            select: { categoryId: true },
        });
        if (!sourceProduct)
            return [];
        return this.prisma.product.findMany({
            where: {
                categoryId: sourceProduct.categoryId,
                id: { not: id },
                isDeleted: false,
            },
            take: limit,
            orderBy: { soldCount: 'desc' },
            select: {
                id: true,
                name: true,
                price: true,
                images: true,
                soldCount: true,
                category: { select: { id: true, name: true } },
            }
        });
    }
    async update(id, data) {
        return this.prisma.product.update({
            where: { id },
            data,
        });
    }
    async remove(id) {
        return this.prisma.product.update({
            where: { id },
            data: { isDeleted: true },
        });
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map