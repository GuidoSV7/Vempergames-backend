import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsUUID, IsPositive, IsOptional, IsBoolean, Min, Max } from 'class-validator';

export class CreateProductPriceDto {
  @ApiProperty({
    description: 'Nombre del tipo de precio',
    example: 'Precio Regular'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Valor del precio',
    example: 29.99
  })
  @IsNumber()
  @IsPositive()
  value: number;

  @ApiProperty({
    description: 'Porcentaje de descuento (0-100)',
    example: 30,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @ApiProperty({
    description: 'Estado del precio (activo/inactivo)',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  state?: boolean;

  @ApiProperty({
    description: 'ID del producto al que pertenece este precio',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsNotEmpty()
  productId: string;
}
