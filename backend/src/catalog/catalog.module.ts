import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { CategoriesService } from './categories/categories.service';
import { CategoriesController } from './categories/categories.controller';
import { ProductsService } from './products/products.service';
import { ProductsController } from './products/products.controller';

@Module({
  imports: [
    MulterModule.register({}), // Dùng memory storage cho upload Excel
  ],
  providers: [CategoriesService, ProductsService],
  controllers: [CategoriesController, ProductsController],
})
export class CatalogModule {}
