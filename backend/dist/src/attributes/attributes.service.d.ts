import { PrismaService } from '../prisma/prisma.service';
export declare class AttributesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        name: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        values: string[];
    }[]>;
    findOne(id: number): Promise<{
        name: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        values: string[];
    }>;
    create(data: {
        name: string;
        values: string[];
    }): Promise<{
        name: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        values: string[];
    }>;
    update(id: number, data: {
        name?: string;
        values?: string[];
    }): Promise<{
        name: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        values: string[];
    }>;
    remove(id: number): Promise<{
        name: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        values: string[];
    }>;
}
