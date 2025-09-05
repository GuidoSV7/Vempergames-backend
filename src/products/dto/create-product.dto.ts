import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsOptional, IsBoolean } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Título del producto',
    example: 'Gift Card Amazon $50'
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Descripción del producto',
    example: 'Gift card de Amazon por valor de $50 USD'
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'URL de la imagen del producto',
    example: 'https://example.com/image.jpg'
  })
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @ApiProperty({
    description: 'Código de canje del producto',
    example: 'ABC123XYZ'
  })
  @IsString()
  @IsNotEmpty()
  redeem: string;

  @ApiProperty({
    description: 'Términos y condiciones del producto',
    example: 'Válido por 1 año desde la compra'
  })
  @IsString()
  @IsNotEmpty()
  termsConditions: string;

  @ApiProperty({
    description: 'Estado del producto (activo/inactivo)',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  state?: boolean;

  @ApiProperty({
    description: 'ID de la categoría del producto',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;
}
