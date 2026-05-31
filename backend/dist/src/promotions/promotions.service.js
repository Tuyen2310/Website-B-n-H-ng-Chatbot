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
exports.PromotionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PromotionsService = class PromotionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.promotion.create({ data });
    }
    async findAll(skip, take) {
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
    async findOne(id) {
        const promotion = await this.prisma.promotion.findUnique({ where: { id } });
        if (!promotion)
            throw new common_1.NotFoundException('Promotion not found');
        return promotion;
    }
    async findByCode(code) {
        const promotion = await this.prisma.promotion.findUnique({ where: { code } });
        if (!promotion)
            return null;
        const now = new Date();
        if (!promotion.isActive || now < promotion.startDate || now > promotion.endDate) {
            return null;
        }
        return promotion;
    }
    async update(id, data) {
        return this.prisma.promotion.update({
            where: { id },
            data,
        });
    }
    async remove(id) {
        return this.prisma.promotion.delete({
            where: { id },
        });
    }
};
exports.PromotionsService = PromotionsService;
exports.PromotionsService = PromotionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PromotionsService);
//# sourceMappingURL=promotions.service.js.map