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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminService = class AdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardStats(filters) {
        const { timeRange = 'ALL', startDate, endDate } = filters || {};
        let gte;
        let lte;
        const now = new Date();
        if (timeRange === 'TODAY') {
            gte = new Date(now.setHours(0, 0, 0, 0));
        }
        else if (timeRange === 'THIS_WEEK') {
            const first = now.getDate() - now.getDay();
            gte = new Date(now.setDate(first));
            gte.setHours(0, 0, 0, 0);
        }
        else if (timeRange === 'THIS_MONTH') {
            gte = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        else if (timeRange === 'LAST_MONTH') {
            gte = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            lte = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        }
        else if (timeRange === 'THIS_YEAR') {
            gte = new Date(now.getFullYear(), 0, 1);
        }
        else if (timeRange === 'CUSTOM' && startDate) {
            gte = new Date(startDate);
            if (endDate) {
                lte = new Date(endDate);
                lte.setHours(23, 59, 59, 999);
            }
        }
        const whereClause = {};
        if (gte || lte) {
            whereClause.createdAt = {};
            if (gte)
                whereClause.createdAt.gte = gte;
            if (lte)
                whereClause.createdAt.lte = lte;
        }
        const [totalOrders, totalUsers, totalProducts, revenueData, ordersByStatus, recentOrders] = await Promise.all([
            this.prisma.order.count({ where: whereClause }),
            this.prisma.user.count({ where: { role: 'USER' } }),
            this.prisma.product.count({ where: { isDeleted: false } }),
            this.prisma.order.aggregate({
                _sum: { totalAmount: true },
                where: { ...whereClause, status: 'COMPLETED' },
            }),
            this.prisma.order.groupBy({
                by: ['status'],
                _count: { _all: true },
                where: whereClause
            }),
            this.prisma.order.findMany({
                take: 500,
                where: whereClause,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { name: true } } }
            }),
        ]);
        const lowStockProducts = await this.prisma.product.findMany({
            where: {
                isDeleted: false,
                stock: { lt: 10 }
            },
            select: {
                id: true,
                name: true,
                stock: true,
                price: true,
                images: true,
                category: { select: { name: true } }
            }
        });
        return {
            totalOrders,
            totalUsers,
            totalProducts,
            totalRevenue: revenueData._sum.totalAmount || 0,
            ordersByStatus: ordersByStatus.map(s => ({ status: s.status, count: s._count._all })),
            lowStockCount: lowStockProducts.length,
            lowStockProducts,
            recentOrders: recentOrders.map(o => ({
                id: o.id,
                userName: o.user?.name || o.guestName || 'Khách vãng lai',
                total: o.totalAmount,
                status: o.status,
                createdAt: o.createdAt
            }))
        };
    }
    async getChatbotLogs() {
        return this.prisma.chatbotLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 200
        });
    }
    async getChatbotStats() {
        const totalFaqs = await this.prisma.fAQ.count({ where: { isDeleted: false } });
        const totalLogs = await this.prisma.chatbotLog.count();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const interactionsToday = await this.prisma.chatbotLog.count({
            where: {
                createdAt: {
                    gte: today,
                }
            }
        });
        return {
            totalFaqs,
            totalLogs,
            interactionsToday,
            correctResponseRate: 98.5
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map