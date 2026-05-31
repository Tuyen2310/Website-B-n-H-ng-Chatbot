import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/order.dto';
import { OrderStatus } from '@prisma/client';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(req: any, createOrderDto: CreateOrderDto): Promise<{
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
    findAll(req: any, skip?: string, take?: string): Promise<{
        items: ({
            user: {
                name: string;
                email: string;
                phone: string | null;
            } | null;
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
    updateStatus(id: number, status: OrderStatus): Promise<{
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
    updatePaymentStatus(id: number, paymentStatus: boolean): Promise<{
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
    cancelOrder(req: any, id: number): Promise<{
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
    complete(req: any, id: number): Promise<{
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
}
