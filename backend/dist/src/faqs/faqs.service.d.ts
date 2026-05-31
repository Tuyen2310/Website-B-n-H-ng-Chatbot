import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class FaqsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.FAQCreateInput): Promise<{
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        question: string;
        answer: string;
        topic: string;
        productId: number | null;
    }>;
    findAll(): Promise<{
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        question: string;
        answer: string;
        topic: string;
        productId: number | null;
    }[]>;
    findOne(id: number): Promise<{
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        question: string;
        answer: string;
        topic: string;
        productId: number | null;
    } | null>;
    update(id: number, data: Prisma.FAQUpdateInput): Promise<{
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        question: string;
        answer: string;
        topic: string;
        productId: number | null;
    }>;
    remove(id: number): Promise<{
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        question: string;
        answer: string;
        topic: string;
        productId: number | null;
    }>;
}
