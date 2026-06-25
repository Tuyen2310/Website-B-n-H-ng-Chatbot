import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Role } from '@prisma/client';
import { MailService } from '../mail/mail.service';
export declare class UsersService {
    private prisma;
    private mailService;
    constructor(prisma: PrismaService, mailService: MailService);
    create(data: Prisma.UserCreateInput): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        phone: string | null;
        address: string | null;
        password: string | null;
        role: import(".prisma/client").$Enums.Role;
        isBlocked: boolean;
        points: number;
        googleId: string | null;
        avatar: string | null;
        otpCode: string | null;
        otpExpires: Date | null;
        isVerified: boolean;
    }>;
    createByAdmin(data: {
        name: string;
        email: string;
        password: string;
        phone?: string;
        address?: string;
        role?: Role;
    }): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
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
    findAll(skip?: number, take?: number): Promise<{
        items: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            phone: string | null;
            address: string | null;
            password: string | null;
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
    findOneByEmail(email: string): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        phone: string | null;
        address: string | null;
        password: string | null;
        role: import(".prisma/client").$Enums.Role;
        isBlocked: boolean;
        points: number;
        googleId: string | null;
        avatar: string | null;
        otpCode: string | null;
        otpExpires: Date | null;
        isVerified: boolean;
    } | null>;
    findOneById(id: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        phone: string | null;
        address: string | null;
        password: string | null;
        role: import(".prisma/client").$Enums.Role;
        isBlocked: boolean;
        points: number;
        googleId: string | null;
        avatar: string | null;
        otpCode: string | null;
        otpExpires: Date | null;
        isVerified: boolean;
    } | null>;
    update(id: number, data: {
        name?: string;
        phone?: string;
        address?: string;
        role?: Role;
        isBlocked?: boolean;
    }): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        phone: string | null;
        address: string | null;
        password: string | null;
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
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        phone: string | null;
        address: string | null;
        password: string | null;
        role: import(".prisma/client").$Enums.Role;
        isBlocked: boolean;
        points: number;
        googleId: string | null;
        avatar: string | null;
        otpCode: string | null;
        otpExpires: Date | null;
        isVerified: boolean;
    }>;
    sendOtp(userId: number): Promise<{
        message: string;
    }>;
    changePassword(userId: number, data: {
        oldPassword?: string;
        newPassword: string;
        otpCode?: string;
    }): Promise<{
        message: string;
    }>;
    getWishlist(userId: number): Promise<any>;
    toggleWishlist(userId: number, productId: number): Promise<{
        added: boolean;
    }>;
}
