import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
export declare class SettingsService implements OnModuleInit {
    private prisma;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    private ensureSettingsExist;
    private transformSettings;
    private settingsCache;
    private readonly CACHE_TTL_MS;
    getSettings(): Promise<any>;
    getPublicSettings(): Promise<{
        general: any;
        seo: any;
        payment: {
            bankEnabled: any;
            bankId: any;
            accountNo: any;
            accountName: any;
            momoEnabled: any;
            momoPhone: any;
        };
        security: {
            maintenance: any;
        };
        flashSale: any;
    } | null>;
    updateSettings(data: any): Promise<{
        general: {
            shopName: any;
            tagline: any;
            email: any;
            phone: any;
            address: any;
            facebook: any;
            instagram: any;
            twitter: any;
            logo: any;
            favicon: any;
            banner: any;
            currency: string;
        };
        seo: {
            metaTitle: any;
            metaDescription: any;
            keywords: any;
        };
        payment: {
            bankEnabled: any;
            bankId: any;
            accountNo: any;
            accountName: any;
            momoEnabled: any;
            momoPhone: any;
            vnpayEnabled: any;
            vnpayTmnCode: any;
            vnpayHashSecret: any;
        };
        chatbot: {
            enabled: any;
            apiKey: any;
            model: any;
            welcomeMessage: any;
        };
        security: {
            twoFactor: any;
            maintenance: any;
        };
        flashSale: {
            startTime: any;
            endTime: any;
        };
    } | null>;
    clearCache(): Promise<{
        success: boolean;
        message: string;
    }>;
    terminateSessions(): Promise<{
        success: boolean;
        message: string;
    }>;
}
