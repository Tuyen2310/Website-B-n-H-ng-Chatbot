import { NotificationsGateway } from './notifications.gateway';
export declare class NotificationsService {
    private readonly gateway;
    constructor(gateway: NotificationsGateway);
    sendNewOrderAlert(order: any): void;
    sendOrderStatusUpdate(userId: number, orderId: number, status: string): void;
}
