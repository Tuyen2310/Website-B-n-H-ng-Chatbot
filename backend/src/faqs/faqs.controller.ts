import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { FaqsService } from './faqs.service';
import { Prisma, Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('faqs')
@Controller('faqs')
export class FaqsController {
  constructor(private readonly faqsService: FaqsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new FAQ (Admin only)' })
  create(@Body() data: Prisma.FAQCreateInput) {
    return this.faqsService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active FAQs' })
  findAll() {
    return this.faqsService.findAll();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an FAQ (Admin only)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() data: Prisma.FAQUpdateInput) {
    return this.faqsService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an FAQ (Admin only)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.faqsService.remove(id);
  }
}
