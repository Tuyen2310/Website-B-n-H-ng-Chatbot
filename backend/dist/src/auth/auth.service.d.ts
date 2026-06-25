import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { MailService } from '../mail/mail.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    private mailService;
    constructor(usersService: UsersService, jwtService: JwtService, mailService: MailService);
    validateUser(email: string, pass: string): Promise<any>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: any;
    }>;
    register(registerDto: RegisterDto): Promise<{
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
    validateOAuthLogin(profile: any): Promise<{
        access_token: string;
        user: {
            id: number;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            points: any;
            avatar: any;
        };
    }>;
}
