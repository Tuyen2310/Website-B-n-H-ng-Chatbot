import { AttributesService } from './attributes.service';
export declare class AttributesController {
    private readonly attributesService;
    constructor(attributesService: AttributesService);
    findAll(): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        values: string[];
    }[]>;
    findOne(id: string): Promise<{
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
    update(id: string, data: {
        name?: string;
        values?: string[];
    }): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        values: string[];
    }>;
    remove(id: string): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        values: string[];
    }>;
}
