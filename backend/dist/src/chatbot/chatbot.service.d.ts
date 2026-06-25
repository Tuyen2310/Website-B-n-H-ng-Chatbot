import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
export declare class ChatbotService implements OnModuleInit {
    private prisma;
    private configService;
    private genAI;
    private model;
    private readonly logger;
    constructor(prisma: PrismaService, configService: ConfigService);
    onModuleInit(): void;
    chat(message: string, userId?: number): Promise<{
        response: string;
        suggestions?: undefined;
    } | {
        response: any;
        suggestions: string[];
    }>;
}
