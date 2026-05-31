import { PromotionsService } from './promotions.service';
import { Prisma } from '@prisma/client';
export declare class PromotionsController {
    private readonly promotionsService;
    constructor(promotionsService: PromotionsService);
    create(data: Prisma.PromotionCreateInput): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
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
    findAll(skip?: string, take?: string): Promise<{
        items: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
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
    validate(code: string): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
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
    findOne(id: number): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
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
    update(id: number, data: Prisma.PromotionUpdateInput): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
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
        createdAt: Date;
        updatedAt: Date;
        id: number;
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
