import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/order.dto';
import { OrderStatus } from '@prisma/client';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(req: any, createOrderDto: CreateOrderDto): Promise<{
        items: ({
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
                attributes: import("@prisma/client/runtime/library").JsonValue | null;
                isFlashSale: boolean;
                flashSalePrice: number | null;
                isDeleted: boolean;
                createdAt: Date;
                updatedAt: Date;
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
        id: number;
        createdAt: Date;
        updatedAt: Date;
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
    findAll(req: any, skip?: string, take?: string): Promise<{
        items: ({
            user: {
                name: string;
                email: string;
                phone: string | null;
            } | null;
            items: ({
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
                    attributes: import("@prisma/client/runtime/library").JsonValue | null;
                    isFlashSale: boolean;
                    flashSalePrice: number | null;
                    isDeleted: boolean;
                    createdAt: Date;
                    updatedAt: Date;
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
            id: number;
            createdAt: Date;
            updatedAt: Date;
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
        })[];
        total: number;
    }>;
    findOne(req: any, id: number): Promise<{
        user: {
            name: string;
            email: string;
            phone: string | null;
            address: string | null;
        } | null;
        items: ({
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
                attributes: import("@prisma/client/runtime/library").JsonValue | null;
                isFlashSale: boolean;
                flashSalePrice: number | null;
                isDeleted: boolean;
                createdAt: Date;
                updatedAt: Date;
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
        id: number;
        createdAt: Date;
        updatedAt: Date;
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
    updateStatus(id: number, status: OrderStatus): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
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
    updatePaymentStatus(id: number, paymentStatus: boolean): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
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
    cancelOrder(req: any, id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
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
    complete(req: any, id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
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
}
