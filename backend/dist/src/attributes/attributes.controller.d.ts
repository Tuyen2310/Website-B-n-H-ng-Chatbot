import { AttributesService } from './attributes.service';
export declare class AttributesController {
    private readonly attributesService;
    constructor(attributesService: AttributesService);
    findAll(): Promise<{
        name: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        values: string[];
    }[]>;
    findOne(id: string): Promise<{
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
    update(id: string, data: {
        name?: string;
        values?: string[];
    }): Promise<{
        name: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        values: string[];
    }>;
    remove(id: string): Promise<{
        name: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        values: string[];
    }>;
}
