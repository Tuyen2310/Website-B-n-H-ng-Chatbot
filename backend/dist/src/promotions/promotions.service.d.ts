import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class PromotionsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.PromotionCreateInput): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        discountAmount: number | null;
        discountPercent: number | null;
        type: import(".prisma/client").$Enums.PromotionType;
        code: string;
        minOrderAmount: number | null;
        maxDiscount: number | null;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
    }>;
    findAll(skip?: number, take?: number): Promise<{
        items: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            discountAmount: number | null;
            discountPercent: number | null;
            type: import(".prisma/client").$Enums.PromotionType;
            code: string;
            minOrderAmount: number | null;
            maxDiscount: number | null;
            startDate: Date;
            endDate: Date;
            isActive: boolean;
        }[];
        total: number;
    }>;
    findOne(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        discountAmount: number | null;
        discountPercent: number | null;
        type: import(".prisma/client").$Enums.PromotionType;
        code: string;
        minOrderAmount: number | null;
        maxDiscount: number | null;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
    }>;
    findByCode(code: string): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        discountAmount: number | null;
        discountPercent: number | null;
        type: import(".prisma/client").$Enums.PromotionType;
        code: string;
        minOrderAmount: number | null;
        maxDiscount: number | null;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
    } | null>;
    update(id: number, data: Prisma.PromotionUpdateInput): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        discountAmount: number | null;
        discountPercent: number | null;
        type: import(".prisma/client").$Enums.PromotionType;
        code: string;
        minOrderAmount: number | null;
        maxDiscount: number | null;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
    }>;
    remove(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        discountAmount: number | null;
        discountPercent: number | null;
        type: import(".prisma/client").$Enums.PromotionType;
        code: string;
        minOrderAmount: number | null;
        maxDiscount: number | null;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
    }>;
}
