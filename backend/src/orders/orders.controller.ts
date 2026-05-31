import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, ParseIntPipe, Delete, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/order.dto';
import { OrderStatus, Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  create(@Request() req: any, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(req.user.userId, createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders (Customer gets their own, Admin gets all)' })
  findAll(
    @Request() req: any,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    if (req.user.role === Role.ADMIN) {
      return this.ordersService.findAll(undefined, skip ? +skip : undefined, take ? +take : undefined);
    }
    return this.ordersService.findAll(req.user.userId, skip ? +skip : undefined, take ? +take : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details' })
  findOne(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    if (req.user.role === Role.ADMIN) {
      return this.ordersService.findOne(id);
    }
    return this.ordersService.findOne(id, req.user.userId);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update order status (Admin only)' })
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body('status') status: OrderStatus) {
    return this.ordersService.updateStatus(id, status);
  }

  @Patch(':id/payment')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update payment status (Admin only)' })
  updatePaymentStatus(@Param('id', ParseIntPipe) id: number, @Body('paymentStatus') paymentStatus: boolean) {
    return this.ordersService.updatePaymentStatus(id, paymentStatus);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel order' })
  cancelOrder(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    if (req.user.role === Role.ADMIN) {
      return this.ordersService.cancelOrder(id);
    }
    return this.ordersService.cancelOrder(id, req.user.userId);
  }
  @Patch(':id/complete')
  @ApiOperation({ summary: 'Customer confirm order receipt' })
  complete(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.ordersService.completeOrder(id, req.user.userId);
  }
}
