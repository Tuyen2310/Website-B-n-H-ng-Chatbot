import { OrdersService } from './orders.service';
import type { Response } from 'express';
import { OrderStatus } from '@prisma/client';
import { CreateOrderDto } from './dto/order.dto';
export declare class OrdersQuickController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    createGuestOrder(createOrderDto: CreateOrderDto): Promise<{
        items: ({
            product: {
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
                attributes: import("@prisma/client/runtime/library").JsonValue | null;
                isFlashSale: boolean;
                flashSalePrice: number | null;
                categoryId: number;
            };
        } & {
            id: number;
            price: number;
            productId: number;
            quantity: number;
            orderId: number;
            variantId: number | null;
        })[];
    } & {
        createdAt: Date;
        updatedAt: Date;
        id: number;
        discountAmount: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        paymentId: string | null;
        userId: number | null;
        guestName: string | null;
        guestEmail: string | null;
        guestPhone: string | null;
        totalAmount: number;
        shippingFee: number;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        paymentStatus: boolean;
        paymentUrl: string | null;
        shippingAddress: string;
        pointsUsed: number | null;
    }>;
    updateStatusQuick(id: string, status: OrderStatus, token: string, res: Response): Promise<Response<any, Record<string, any>>>;
}
