import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsUUID, IsPositive } from 'class-validator';

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
    description: 'ID del producto al que pertenece este precio',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsNotEmpty()
  productId: string;
}
