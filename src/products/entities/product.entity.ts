import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Category } from './category.entity';
import { ProductPrices } from './product-prices.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Título del producto',
    example: 'Gift Card Amazon $50'
  })
  @Column('text')
  title: string;

  @ApiProperty({
    description: 'Descripción del producto',
    example: 'Gift card de Amazon por valor de $50 USD'
  })
  @Column('text')
  description: string;

  @ApiProperty({
    description: 'URL de la imagen del producto',
    example: 'https://example.com/image.jpg'
  })
  @Column('text')
  imageUrl: string;

  @ApiProperty({
    description: 'Código de canje del producto',
    example: 'ABC123XYZ'
  })
  @Column('text')
  redeem: string;

  @ApiProperty({
    description: 'Términos y condiciones del producto',
    example: 'Válido por 1 año desde la compra'
  })
  @Column('text')
  termsConditions: string;

  @ApiProperty({
    description: 'Estado del producto (activo/inactivo)',
    example: true
  })
  @Column('boolean', { default: true })
  state: boolean;

  @ApiProperty({
    description: 'Categoría del producto',
    type: () => Category
  })
  @ManyToOne(() => Category, { eager: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column('uuid')
  categoryId: string;

  @ApiProperty({
    description: 'Precios del producto',
    type: () => [ProductPrices]
  })
  @OneToMany(() => ProductPrices, price => price.product)
  prices: ProductPrices[];
}
