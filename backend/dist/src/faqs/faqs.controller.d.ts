import { FaqsService } from './faqs.service';
import { Prisma } from '@prisma/client';
export declare class FaqsController {
    private readonly faqsService;
    constructor(faqsService: FaqsService);
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
