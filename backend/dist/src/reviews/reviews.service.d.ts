import { PrismaService } from '../prisma/prisma.service';
export declare class ReviewsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: number, productId: number, rating: number, comment?: string): Promise<{
        user: {
            name: string;
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
    }>;
    findByProduct(productId: number): Promise<({
        user: {
            name: string;
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
    })[]>;
    reply(reviewId: number, reply: string): Promise<{
        id: number;
        createdAt: Date;
        productId: number;
        userId: number;
        rating: number;
        comment: string | null;
        reply: string | null;
        repliedAt: Date | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        createdAt: Date;
        productId: number;
        userId: number;
        rating: number;
        comment: string | null;
        reply: string | null;
        repliedAt: Date | null;
    }>;
}
