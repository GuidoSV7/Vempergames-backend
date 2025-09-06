import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from './product.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Nombre de la categoría',
    example: 'Gift Cards'
  })
  @Column('text', { unique: true })
  name: string;

  @ApiProperty({
    description: 'Estado de la categoría (soft delete)',
    example: true
  })
  @Column('boolean', { default: true })
  state: boolean;

  @OneToMany(() => Product, product => product.category)
  products: Product[];
}
