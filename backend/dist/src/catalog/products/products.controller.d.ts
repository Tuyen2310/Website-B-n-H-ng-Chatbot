import { StreamableFile } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Prisma } from '@prisma/client';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
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
    findAll(category?: string, search?: string, minPrice?: string, maxPrice?: string, sortBy?: string, sortOrder?: 'asc' | 'desc', skip?: string, take?: string, isFlashSale?: string): Promise<{
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
    downloadTemplate(): StreamableFile;
    importExcel(file: Express.Multer.File): Promise<{
        success: number;
        failed: number;
        errors: {
            row: number;
            error: string;
        }[];
        imported: any[];
    } | {
        error: string;
    }>;
    bulkRemove(ids: number[]): Promise<Prisma.BatchPayload>;
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
    getRecommendations(id: number): Promise<{
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
}
