import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiResponse } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Product } from './entities/product.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiResponse({status:201, description:'Producto Creado exitosamente', type: Product})
  @ApiResponse({status:400, description:'Bad Request'})
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll( @Query() paginationDto:PaginationDto)  {
    return this.productsService.findAll(paginationDto);
  }

  @Get('admin/all')
  @ApiResponse({status:200, description:'Todos los productos (activos, inactivos y eliminados)', type: [Product]})
  findAllWithAllStates( @Query() paginationDto:PaginationDto)  {
    return this.productsService.findAllWithAllStates(paginationDto);
  }

  @Get('category/:categoryId')
  findByCategory(@Param('categoryId') categoryId: string) {
    return this.productsService.findByCategory(categoryId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string ,
        @Body() updateProductDto: UpdateProductDto) 
        {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Patch(':id/restore')
  @ApiResponse({status:200, description:'Producto restaurado exitosamente', type: Product})
  @ApiResponse({status:400, description:'Bad Request - Producto no está eliminado'})
  @ApiResponse({status:404, description:'Producto no encontrado'})
  restore(@Param('id') id: string) {
    return this.productsService.restore(id);
  }
}
