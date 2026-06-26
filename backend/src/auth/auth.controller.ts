import { Controller, Post, Body, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Login with Google' })
  async googleAuth(@Req() req) {
    // Initiates the Google OAuth2 login flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google Auth Callback' })
  async googleAuthRedirect(@Req() req: any, @Res() res: any) {
    const jwt = await this.authService.validateOAuthLogin(req.user);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/auth/callback?token=${jwt.access_token}&user=${encodeURIComponent(JSON.stringify(jwt.user))}`);
  }
}
