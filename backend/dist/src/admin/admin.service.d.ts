import { PrismaService } from '../prisma/prisma.service';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboardStats(filters?: {
        timeRange?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<{
        totalOrders: number;
        totalUsers: number;
        totalProducts: number;
        totalRevenue: number;
        ordersByStatus: {
            status: import(".prisma/client").$Enums.OrderStatus;
            count: number;
        }[];
        lowStockCount: number;
        lowStockProducts: {
            name: string;
            id: number;
            category: {
                name: string;
            };
            price: number;
            images: string[];
            stock: number;
        }[];
        recentOrders: {
            id: number;
            userName: any;
            total: number;
            status: import(".prisma/client").$Enums.OrderStatus;
            createdAt: Date;
        }[];
    }>;
    getChatbotLogs(): Promise<{
        createdAt: Date;
        id: number;
        question: string;
        answer: string;
        userId: number | null;
    }[]>;
}
