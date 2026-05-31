import { Controller, Get, Post, Patch, Body, UseGuards, Request, Param, ParseIntPipe, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('send-otp')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Send OTP to current user email' })
  async sendOtp(@Request() req: any) {
    return this.usersService.sendOtp(req.user.userId);
  }

  @Patch('change-password')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Change current user password' })
  async changePassword(@Request() req: any, @Body() data: { oldPassword?: string; newPassword: string; otpCode?: string }) {
    return this.usersService.changePassword(req.user.userId, data);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create user (Admin only)' })
  async create(@Body() data: { name: string; email: string; password: string; phone?: string; address?: string; role?: Role }) {
    return this.usersService.createByAdmin(data);
  }

  @Get('me')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@Request() req: any) {
    const user = await this.usersService.findOneById(req.user.userId);
    if (!user) {
      throw new Error('User not found');
    }
    const { password, ...result } = user;
    return result;
  }

  @Patch('me')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Update current user profile' })
  async updateMe(@Request() req: any, @Body() data: { name?: string; phone?: string; address?: string }) {
    return this.usersService.update(req.user.userId, data);
  }

  @Get('wishlist')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Get user wishlist' })
  async getWishlist(@Request() req: any) {
    return this.usersService.getWishlist(req.user.userId);
  }

  @Post('wishlist/:productId')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Toggle product in wishlist' })
  async toggleWishlist(@Request() req: any, @Param('productId', ParseIntPipe) productId: number) {
    return this.usersService.toggleWishlist(req.user.userId, productId);
  }

  // Admin Routes
  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const result = await this.usersService.findAll(skip ? +skip : undefined, take ? +take : undefined);
    return {
      items: result.items.map(user => {
        const { password, ...rest } = user;
        return rest;
      }),
      total: result.total,
    };
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update user (Admin only)' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.usersService.update(id, data);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
