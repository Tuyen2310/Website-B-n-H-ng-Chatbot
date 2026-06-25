import { PrismaService } from '../prisma/prisma.service';
export declare class AttributesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        values: string[];
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        values: string[];
    }>;
    create(data: {
        name: string;
        values: string[];
    }): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        values: string[];
    }>;
    update(id: number, data: {
        name?: string;
        values?: string[];
    }): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        values: string[];
    }>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        values: string[];
    }>;
}
