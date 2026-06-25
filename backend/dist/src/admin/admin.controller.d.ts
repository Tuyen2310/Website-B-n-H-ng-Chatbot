import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getStats(timeRange?: string, startDate?: string, endDate?: string): Promise<{
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
            id: number;
            name: string;
            price: number;
            images: string[];
            stock: number;
            category: {
                name: string;
            };
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
        id: number;
        createdAt: Date;
        question: string;
        answer: string;
        userId: number | null;
    }[]>;
    getChatbotStats(): Promise<{
        totalFaqs: number;
        totalLogs: number;
        interactionsToday: number;
        correctResponseRate: number;
    }>;
}
