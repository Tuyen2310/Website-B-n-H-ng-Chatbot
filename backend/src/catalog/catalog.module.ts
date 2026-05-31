import { Module } from '@nestjs/common';
import { CategoriesService } from './categories/categories.service';
import { CategoriesController } from './categories/categories.controller';
import { ProductsService } from './products/products.service';
import { ProductsController } from './products/products.controller';

@Module({
  providers: [CategoriesService, ProductsService],
  controllers: [CategoriesController, ProductsController]
})
export class CatalogModule {}
