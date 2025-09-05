import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProductPricesService } from './product-prices.service';
import { CreateProductPriceDto } from './dto/create-product-price.dto';
import { UpdateProductPriceDto } from './dto/update-product-price.dto';
import { ApiResponse } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ProductPrices } from './entities/product-prices.entity';

@Controller('product-prices')
export class ProductPricesController {
  constructor(private readonly productPricesService: ProductPricesService) {}

  @Post()
  @ApiResponse({status:201, description:'Precio de Producto Creado exitosamente', type: ProductPrices})
  @ApiResponse({status:400, description:'Bad Request'})
  create(@Body() createProductPriceDto: CreateProductPriceDto) {
    return this.productPricesService.create(createProductPriceDto);
  }

  @Get()
  findAll( @Query() paginationDto:PaginationDto)  {
    return this.productPricesService.findAll(paginationDto);
  }

  @Get('product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.productPricesService.findByProduct(productId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productPricesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string ,
        @Body() updateProductPriceDto: UpdateProductPriceDto) 
        {
    return this.productPricesService.update(id, updateProductPriceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productPricesService.remove(id);
  }
}
