import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { ProductPricesService } from './product-prices.service';
import { ProductPricesController } from './product-prices.controller';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { ProductPrices } from './entities/product-prices.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category, ProductPrices])],
  controllers: [ProductsController, CategoriesController, ProductPricesController],
  providers: [ProductsService, CategoriesService, ProductPricesService],
  exports: [ProductsService, CategoriesService, ProductPricesService]
})
export class ProductsModule {}
