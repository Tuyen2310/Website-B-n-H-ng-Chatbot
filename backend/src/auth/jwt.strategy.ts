import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secretKey',
    });
  }

  async validate(payload: any) {
    const user: any = await this.usersService.findOneById(payload.sub);
    if (!user || user.isBlocked) {
      throw new UnauthorizedException(user?.isBlocked ? 'Tài khoản của bạn đã bị khóa.' : 'Không tìm thấy người dùng.');
    }
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
