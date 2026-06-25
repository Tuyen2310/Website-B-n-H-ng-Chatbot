import {
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards,
  Query, ParseIntPipe, UseInterceptors, UploadedFile, Header, StreamableFile
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { Prisma, Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product (Admin only)' })
  create(@Body() data: Prisma.ProductUncheckedCreateInput) {
    return this.productsService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with filtering' })
  @ApiQuery({ name: 'category', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'isFlashSale', required: false, type: Boolean })
  findAll(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('isFlashSale') isFlashSale?: string,
  ) {
    return this.productsService.findAll({
      category: category ? +category : undefined,
      search,
      minPrice: minPrice ? +minPrice : undefined,
      maxPrice: maxPrice ? +maxPrice : undefined,
      sortBy,
      sortOrder,
      skip: skip ? +skip : undefined,
      take: take ? +take : undefined,
      isFlashSale: isFlashSale === 'true' || isFlashSale === '1' ? true : undefined,
    });
  }

  /**
   * Tải xuống file Excel mẫu để import sản phẩm
   * GET /products/import/template
   */
  @Get('import/template')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tải xuống file Excel mẫu để import sản phẩm (Admin only)' })
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @Header('Content-Disposition', 'attachment; filename="product-import-template.xlsx"')
  downloadTemplate(): StreamableFile {
    const buffer = this.productsService.generateExcelTemplate();
    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: 'attachment; filename="product-import-template.xlsx"',
    });
  }

  /**
   * Import sản phẩm từ file Excel
   * POST /products/import/excel
   */
  @Post('import/excel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Import sản phẩm từ file Excel (Admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'File Excel (.xlsx hoặc .xls)' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', { storage: (multer as any).memoryStorage() }),
  )
  async importExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { error: 'Vui lòng upload file Excel (.xlsx hoặc .xls)' };
    }
    const isXlsxExt = file.originalname.endsWith('.xlsx') || file.originalname.endsWith('.xls');
    if (!isXlsxExt) {
      return { error: 'Chỉ chấp nhận file Excel (.xlsx hoặc .xls)' };
    }
    return this.productsService.importFromExcel(file.buffer);
  }

  @Post('bulk-delete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete multiple products (Admin only)' })
  @ApiBody({ schema: { type: 'object', properties: { ids: { type: 'array', items: { type: 'number' } } } } })
  bulkRemove(@Body('ids') ids: number[]) {
    return this.productsService.bulkRemove(ids);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Get(':id/recommendations')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000)
  @ApiOperation({ summary: 'Get product recommendations' })
  getRecommendations(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getRecommendations(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product (Admin only)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() data: Prisma.ProductUncheckedUpdateInput) {
    return this.productsService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product (Admin only)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
