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

  @Get('product/:productId/offers')
  @ApiResponse({status:200, description:'Ofertas activas del producto', type: [ProductPrices]})
  findActiveOffersByProduct(@Param('productId') productId: string) {
    return this.productPricesService.findActiveOffersByProduct(productId);
  }

  @Get('offers')
  @ApiResponse({status:200, description:'Todos los productos con ofertas activas'})
  findAllProductsWithOffers() {
    return this.productPricesService.findAllProductsWithOffers();
  }

  @Get('offers-test')
  @ApiResponse({status:200, description:'Test endpoint para ofertas'})
  async testOffers() {
    try {
      const offers = await this.productPricesService.findAll({ limit: 100, offset: 0 });
      return {
        message: 'Test endpoint funcionando',
        totalOffers: offers.length,
        offers: offers.filter(offer => offer.discountPercentage > 0)
      };
    } catch (error) {
      return {
        error: error.message,
        message: 'Error en test endpoint'
      };
    }
  }

  @Get('product/:productId/regular-price')
  @ApiResponse({status:200, description:'Precio regular del producto', type: ProductPrices})
  findRegularPriceByProduct(@Param('productId') productId: string) {
    return this.productPricesService.findRegularPriceByProduct(productId);
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

  @Patch(':id/toggle-state')
  @ApiResponse({status:200, description:'Estado del precio alternado exitosamente', type: ProductPrices})
  togglePriceState(@Param('id') id: string) {
    return this.productPricesService.togglePriceState(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productPricesService.remove(id);
  }
}
