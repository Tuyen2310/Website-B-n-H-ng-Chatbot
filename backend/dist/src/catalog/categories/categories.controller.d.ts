import { CategoriesService } from './categories.service';
import { Prisma } from '@prisma/client';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    create(data: Prisma.CategoryCreateInput): Promise<{
        isDeleted: boolean;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
    findAll(): Promise<{
        isDeleted: boolean;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }[]>;
    findOne(id: number): Promise<{
        isDeleted: boolean;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    } | null>;
    update(id: number, data: Prisma.CategoryUpdateInput): Promise<{
        isDeleted: boolean;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
    remove(id: number): Promise<{
        isDeleted: boolean;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
}
