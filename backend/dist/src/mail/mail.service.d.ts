import { MailerService } from '@nestjs-modules/mailer';
export declare class MailService {
    private readonly mailerService;
    private readonly logger;
    constructor(mailerService: MailerService);
    private executeSendMail;
    sendOrderConfirmation(email: string, orderDetails: any): Promise<void>;
    sendWelcomeEmail(email: string, name: string): Promise<boolean>;
    sendOtpEmail(email: string, otpCode: string, name: string): Promise<boolean>;
    sendAdminNewOrderAlert(adminEmails: string[], orderDetails: any, token: string): Promise<void>;
}
