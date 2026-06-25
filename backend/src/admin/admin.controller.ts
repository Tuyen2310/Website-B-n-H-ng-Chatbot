import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getStats(
    @Query('timeRange') timeRange?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.getDashboardStats({ timeRange, startDate, endDate });
  }
  @Get('chatbot-logs')
  @ApiOperation({ summary: 'Get recent chatbot interaction logs' })
  async getChatbotLogs() {
    return this.adminService.getChatbotLogs();
  }

  @Get('chatbot-stats')
  @ApiOperation({ summary: 'Get chatbot statistics' })
  async getChatbotStats() {
    return this.adminService.getChatbotStats();
  }
}
