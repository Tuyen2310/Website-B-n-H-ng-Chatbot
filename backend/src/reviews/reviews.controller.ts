import { Controller, Post, Body, Get, Param, UseGuards, Request, ParseIntPipe, Delete, Patch } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a product review' })
  async create(
    @Request() req: any,
    @Body('productId', ParseIntPipe) productId: number,
    @Body('rating', ParseIntPipe) rating: number,
    @Body('comment') comment?: string,
  ) {
    return this.reviewsService.create(req.user.userId, productId, rating, comment);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get all reviews for a product' })
  async findByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.reviewsService.findByProduct(productId);
  }

  @Patch(':id/reply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin reply to a review' })
  async reply(
    @Param('id', ParseIntPipe) id: number,
    @Body('reply') reply: string,
  ) {
    return this.reviewsService.reply(id, reply);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin delete a review' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.remove(id);
  }
}
