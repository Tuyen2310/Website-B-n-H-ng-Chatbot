import { SettingsService } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
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
    } | null>;
    getSettings(): Promise<any>;
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
    } | null>;
    clearCache(): Promise<{
        success: boolean;
        message: string;
    }>;
    terminateSessions(): Promise<{
        success: boolean;
        message: string;
    }>;
    uploadFile(file: Express.Multer.File): Promise<{
        url: string;
    }>;
}
