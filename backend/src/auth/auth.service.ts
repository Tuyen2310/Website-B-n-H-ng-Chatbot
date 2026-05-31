import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto } from './dto/auth.dto';

import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && user.password && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user
    };
  }

  async register(registerDto: RegisterDto) {
    const existing = await this.usersService.findOneByEmail(registerDto.email);
    if (existing) {
      throw new ConflictException('Email này đã được sử dụng. Vui lòng chọn email khác.');
    }
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });
    
    // Gửi email chào mừng
    try {
      this.mailService.sendWelcomeEmail(user.email, user.name);
    } catch (e) {
      console.error('Email error:', e);
    }

    const { password, ...result } = user;
    return result;
  }

  async validateOAuthLogin(profile: any) {
    const { email, firstName, lastName, googleId, picture } = profile;
    const name = `${firstName || ''} ${lastName || ''}`.trim();
    
    let user = await this.usersService.findOneByEmail(email);
    
    if (user) {
      // Nếu đã có user bằng email này, cập nhật googleId nếu chưa có
      if (!(user as any).googleId) {
        user = await (this.usersService.update as any)(user.id, { googleId, avatar: picture });
      }
    } else {
      // Đăng ký user mới qua Google
      user = await (this.usersService.create as any)({
        email,
        name: name || 'Google User',
        googleId,
        avatar: picture,
      });
      // Gửi email chào mừng
      try {
        this.mailService.sendWelcomeEmail(user!.email, user!.name);
      } catch (e) {
        console.error('Email error:', e);
      }
    }

    const payload = { email: user!.email, sub: user!.id, role: user!.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user!.id,
        email: user!.email,
        name: user!.name,
        role: user!.role,
        points: (user as any).points,
        avatar: (user as any).avatar,
      }
    };
  }
}
