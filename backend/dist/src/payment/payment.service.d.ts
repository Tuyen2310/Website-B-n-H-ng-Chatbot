import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
export declare class PaymentService {
    private prisma;
    private settingsService;
    constructor(prisma: PrismaService, settingsService: SettingsService);
    createPaymentLink(orderId: number, method: string): Promise<{
        paymentUrl: string;
        paymentId: string;
    }>;
    verifyPayment(paymentId: string): Promise<{
        status: string;
        orderId: number;
        amount: number;
    }>;
    handleWebhook(payload: any): Promise<{
        success: boolean;
    }>;
}
