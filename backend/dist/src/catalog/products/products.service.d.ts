import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export interface ProductImportRow {
    name: string;
    price: number;
    description: string;
    stock: number;
    categoryId: number;
    images?: string;
    videoUrl?: string;
    isFlashSale?: boolean | string | number;
    flashSalePrice?: number;
    attributes?: string;
    sku?: string;
}
export declare class ProductsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.ProductUncheckedCreateInput): Promise<{
        id: number;
        name: string;
        price: number;
        description: string;
        images: string[];
        videoUrl: string | null;
        stock: number;
        soldCount: number;
        categoryId: number;
        attributes: Prisma.JsonValue | null;
        isFlashSale: boolean;
        flashSalePrice: number | null;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(query: {
        category?: number;
        search?: string;
        minPrice?: number;
        maxPrice?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
        skip?: number;
        take?: number;
        isFlashSale?: boolean | string;
    }): Promise<{
        items: ({
            category: {
                id: number;
                name: string;
                description: string | null;
                isDeleted: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: number;
            name: string;
            price: number;
            description: string;
            images: string[];
            videoUrl: string | null;
            stock: number;
            soldCount: number;
            categoryId: number;
            attributes: Prisma.JsonValue | null;
            isFlashSale: boolean;
            flashSalePrice: number | null;
            isDeleted: boolean;
            createdAt: Date;
            updatedAt: Date;
        })[];
        total: number;
    }>;
    findOne(id: number): Promise<({
        category: {
            id: number;
            name: string;
            description: string | null;
            isDeleted: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        reviews: ({
            user: {
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                email: string;
                phone: string | null;
                address: string | null;
                password: string | null;
                role: import(".prisma/client").$Enums.Role;
                isBlocked: boolean;
                points: number;
                googleId: string | null;
                avatar: string | null;
                otpCode: string | null;
                otpExpires: Date | null;
                isVerified: boolean;
            };
        } & {
            id: number;
            createdAt: Date;
            productId: number;
            userId: number;
            rating: number;
            comment: string | null;
            reply: string | null;
            repliedAt: Date | null;
        })[];
    } & {
        id: number;
        name: string;
        price: number;
        description: string;
        images: string[];
        videoUrl: string | null;
        stock: number;
        soldCount: number;
        categoryId: number;
        attributes: Prisma.JsonValue | null;
        isFlashSale: boolean;
        flashSalePrice: number | null;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    getRecommendations(id: number, limit?: number): Promise<{
        id: number;
        name: string;
        price: number;
        images: string[];
        soldCount: number;
        isFlashSale: boolean;
        flashSalePrice: number | null;
        category: {
            id: number;
            name: string;
        };
    }[]>;
    update(id: number, data: Prisma.ProductUncheckedUpdateInput): Promise<{
        id: number;
        name: string;
        price: number;
        description: string;
        images: string[];
        videoUrl: string | null;
        stock: number;
        soldCount: number;
        categoryId: number;
        attributes: Prisma.JsonValue | null;
        isFlashSale: boolean;
        flashSalePrice: number | null;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        price: number;
        description: string;
        images: string[];
        videoUrl: string | null;
        stock: number;
        soldCount: number;
        categoryId: number;
        attributes: Prisma.JsonValue | null;
        isFlashSale: boolean;
        flashSalePrice: number | null;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    bulkRemove(ids: number[]): Promise<Prisma.BatchPayload>;
    generateExcelTemplate(): Buffer;
    importFromExcel(fileBuffer: Buffer): Promise<{
        success: number;
        failed: number;
        errors: {
            row: number;
            error: string;
        }[];
        imported: any[];
    }>;
}
