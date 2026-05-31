import { ChatbotService } from './chatbot.service';
export declare class ChatbotController {
    private readonly chatbotService;
    constructor(chatbotService: ChatbotService);
    chat(message: string, req: any): Promise<{
        response: any;
    }>;
}
