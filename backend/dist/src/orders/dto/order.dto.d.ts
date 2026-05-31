import { PaymentMethod } from '@prisma/client';
export declare class OrderItemDto {
    productId: number;
    quantity: number;
}
export declare class CreateOrderDto {
    items: OrderItemDto[];
    paymentMethod: PaymentMethod;
    shippingAddress: string;
    voucherCode?: string;
    shippingProvince: string;
    guestName?: string;
    guestEmail?: string;
    guestPhone?: string;
    pointsUsed?: number;
}
