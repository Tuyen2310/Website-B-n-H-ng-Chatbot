import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.CategoryCreateInput): Promise<{
        id: number;
        name: string;
        description: string | null;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        id: number;
        name: string;
        description: string | null;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        name: string;
        description: string | null;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    update(id: number, data: Prisma.CategoryUpdateInput): Promise<{
        id: number;
        name: string;
        description: string | null;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        description: string | null;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
