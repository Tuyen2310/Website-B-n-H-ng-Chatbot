import { UsersService } from './users.service';
import { Role } from '@prisma/client';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    sendOtp(req: any): Promise<{
        message: string;
    }>;
    changePassword(req: any, data: {
        oldPassword?: string;
        newPassword: string;
        otpCode?: string;
    }): Promise<{
        message: string;
    }>;
    create(data: {
        name: string;
        email: string;
        password: string;
        phone?: string;
        address?: string;
        role?: Role;
    }): Promise<{
        name: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        email: string;
        phone: string | null;
        address: string | null;
        role: import(".prisma/client").$Enums.Role;
        isBlocked: boolean;
        points: number;
        googleId: string | null;
        avatar: string | null;
        otpCode: string | null;
        otpExpires: Date | null;
        isVerified: boolean;
    }>;
    getMe(req: any): Promise<{
        name: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        email: string;
        phone: string | null;
        address: string | null;
        role: import(".prisma/client").$Enums.Role;
        isBlocked: boolean;
        points: number;
        googleId: string | null;
        avatar: string | null;
        otpCode: string | null;
        otpExpires: Date | null;
        isVerified: boolean;
    }>;
    updateMe(req: any, data: {
        name?: string;
        phone?: string;
        address?: string;
    }): Promise<{
        name: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        email: string;
        password: string | null;
        phone: string | null;
        address: string | null;
        role: import(".prisma/client").$Enums.Role;
        isBlocked: boolean;
        points: number;
        googleId: string | null;
        avatar: string | null;
        otpCode: string | null;
        otpExpires: Date | null;
        isVerified: boolean;
    }>;
    getWishlist(req: any): Promise<any>;
    toggleWishlist(req: any, productId: number): Promise<{
        added: boolean;
    }>;
    findAll(skip?: string, take?: string): Promise<{
        items: {
            name: string;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            email: string;
            phone: string | null;
            address: string | null;
            role: import(".prisma/client").$Enums.Role;
            isBlocked: boolean;
            points: number;
            googleId: string | null;
            avatar: string | null;
            otpCode: string | null;
            otpExpires: Date | null;
            isVerified: boolean;
        }[];
        total: number;
    }>;
    update(id: number, data: any): Promise<{
        name: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        email: string;
        password: string | null;
        phone: string | null;
        address: string | null;
        role: import(".prisma/client").$Enums.Role;
        isBlocked: boolean;
        points: number;
        googleId: string | null;
        avatar: string | null;
        otpCode: string | null;
        otpExpires: Date | null;
        isVerified: boolean;
    }>;
    remove(id: number): Promise<{
        name: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        email: string;
        password: string | null;
        phone: string | null;
        address: string | null;
        role: import(".prisma/client").$Enums.Role;
        isBlocked: boolean;
        points: number;
        googleId: string | null;
        avatar: string | null;
        otpCode: string | null;
        otpExpires: Date | null;
        isVerified: boolean;
    }>;
}
