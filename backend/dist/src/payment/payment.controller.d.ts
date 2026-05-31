import { PaymentService } from './payment.service';
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    createLink(data: {
        orderId: number;
        method: string;
    }): Promise<{
        paymentUrl: string;
        paymentId: string;
    }>;
    verify(paymentId: string): Promise<{
        status: string;
        orderId: number;
        amount: number;
    }>;
    webhook(payload: any): Promise<{
        success: boolean;
    }>;
}
