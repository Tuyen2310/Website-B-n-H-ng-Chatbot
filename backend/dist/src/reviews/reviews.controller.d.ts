import { ReviewsService } from './reviews.service';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    create(req: any, productId: number, rating: number, comment?: string): Promise<{
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
    reply(id: number, reply: string): Promise<{
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
