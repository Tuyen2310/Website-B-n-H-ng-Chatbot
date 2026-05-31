import { ReviewsService } from './reviews.service';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    create(req: any, productId: number, rating: number, comment?: string): Promise<{
        user: {
            name: string;
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
    }>;
    findByProduct(productId: number): Promise<({
        user: {
            name: string;
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
    })[]>;
    reply(id: number, reply: string): Promise<{
        createdAt: Date;
        id: number;
        productId: number;
        userId: number;
        rating: number;
        comment: string | null;
        reply: string | null;
        repliedAt: Date | null;
    }>;
    remove(id: number): Promise<{
        createdAt: Date;
        id: number;
        productId: number;
        userId: number;
        rating: number;
        comment: string | null;
        reply: string | null;
        repliedAt: Date | null;
    }>;
}
