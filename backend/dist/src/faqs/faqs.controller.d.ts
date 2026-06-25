import { FaqsService } from './faqs.service';
import { Prisma } from '@prisma/client';
export declare class FaqsController {
    private readonly faqsService;
    constructor(faqsService: FaqsService);
    create(data: Prisma.FAQCreateInput): Promise<{
        id: number;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        question: string;
        answer: string;
        topic: string;
        productId: number | null;
    }>;
    findAll(): Promise<({
        product: {
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
        } | null;
    } & {
        id: number;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        question: string;
        answer: string;
        topic: string;
        productId: number | null;
    })[]>;
    update(id: number, data: Prisma.FAQUpdateInput): Promise<{
        id: number;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        question: string;
        answer: string;
        topic: string;
        productId: number | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        question: string;
        answer: string;
        topic: string;
        productId: number | null;
    }>;
}
