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
        categoryId: number;
    }>;
    findAll(category?: string, search?: string, minPrice?: string, maxPrice?: string, sortBy?: string, sortOrder?: 'asc' | 'desc', skip?: string, take?: string): Promise<{
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
            categoryId: number;
        })[];
        total: number;
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
        categoryId: number;
    }>;
}
