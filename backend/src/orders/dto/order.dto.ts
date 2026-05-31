import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';

export class OrderItemDto {
  @ApiProperty()
  @IsInt()
  productId!: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  items!: OrderItemDto[];

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  shippingAddress!: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  voucherCode?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  shippingProvince!: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  guestName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  guestEmail?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  guestPhone?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  @Min(0)
  pointsUsed?: number;
}
