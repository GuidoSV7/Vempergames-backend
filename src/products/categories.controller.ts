import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiResponse } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Category } from './entities/category.entity';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiResponse({status:201, description:'Categoría Creada exitosamente', type: Category})
  @ApiResponse({status:400, description:'Bad Request'})
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiResponse({status:200, description:'Categorías activas obtenidas exitosamente', type: [Category]})
  findAll( @Query() paginationDto:PaginationDto)  {
    return this.categoriesService.findAll(paginationDto);
  }

  @Get('admin/all')
  @ApiResponse({status:200, description:'Todas las categorías (activas e inactivas)', type: [Category]})
  findAllWithAllStates( @Query() paginationDto:PaginationDto)  {
    return this.categoriesService.findAllWithAllStates(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string ,
        @Body() updateCategoryDto: UpdateCategoryDto) 
        {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiResponse({status:200, description:'Categoría eliminada exitosamente (soft delete)', type: Category})
  @ApiResponse({status:404, description:'Categoría no encontrada'})
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }

  @Patch(':id/restore')
  @ApiResponse({status:200, description:'Categoría restaurada exitosamente', type: Category})
  @ApiResponse({status:400, description:'Bad Request - Categoría no está eliminada'})
  @ApiResponse({status:404, description:'Categoría no encontrada'})
  restore(@Param('id') id: string) {
    return this.categoriesService.restore(id);
  }
}
