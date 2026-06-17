import { StreamableFile } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Prisma } from '@prisma/client';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(data: Prisma.ProductUncheckedCreateInput): Promise<{
        isDeleted: boolean;
        name: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        price: number;
        images: string[];
        videoUrl: string | null;
        stock: number;
        soldCount: number;
        attributes: Prisma.JsonValue | null;
        isFlashSale: boolean;
        flashSalePrice: number | null;
        categoryId: number;
    }>;
    findAll(category?: string, search?: string, minPrice?: string, maxPrice?: string, sortBy?: string, sortOrder?: 'asc' | 'desc', skip?: string, take?: string, isFlashSale?: string): Promise<{
        items: ({
            category: {
                isDeleted: boolean;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                id: number;
            };
        } & {
            isDeleted: boolean;
            name: string;
            description: string;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            price: number;
            images: string[];
            videoUrl: string | null;
            stock: number;
            soldCount: number;
            attributes: Prisma.JsonValue | null;
            isFlashSale: boolean;
            flashSalePrice: number | null;
            categoryId: number;
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
    findOne(id: number): Promise<({
        category: {
            isDeleted: boolean;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            id: number;
        };
        reviews: ({
            user: {
                name: string;
                createdAt: Date;
                updatedAt: Date;
                id: number;
                email: string;
                password: string | null;
                phone: string | null;
                address: string | null;
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
            createdAt: Date;
            id: number;
            productId: number;
            userId: number;
            rating: number;
            comment: string | null;
            reply: string | null;
            repliedAt: Date | null;
        })[];
    } & {
        isDeleted: boolean;
        name: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        price: number;
        images: string[];
        videoUrl: string | null;
        stock: number;
        soldCount: number;
        attributes: Prisma.JsonValue | null;
        isFlashSale: boolean;
        flashSalePrice: number | null;
        categoryId: number;
    }) | null>;
    getRecommendations(id: number): Promise<{
        name: string;
        id: number;
        category: {
            name: string;
            id: number;
        };
        price: number;
        images: string[];
        soldCount: number;
        isFlashSale: boolean;
        flashSalePrice: number | null;
    }[]>;
    update(id: number, data: Prisma.ProductUncheckedUpdateInput): Promise<{
        isDeleted: boolean;
        name: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        price: number;
        images: string[];
        videoUrl: string | null;
        stock: number;
        soldCount: number;
        attributes: Prisma.JsonValue | null;
        isFlashSale: boolean;
        flashSalePrice: number | null;
        categoryId: number;
    }>;
    remove(id: number): Promise<{
        isDeleted: boolean;
        name: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        price: number;
        images: string[];
        videoUrl: string | null;
        stock: number;
        soldCount: number;
        attributes: Prisma.JsonValue | null;
        isFlashSale: boolean;
        flashSalePrice: number | null;
        categoryId: number;
    }>;
}
