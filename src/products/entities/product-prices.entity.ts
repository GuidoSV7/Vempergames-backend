import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_prices')
export class ProductPrices {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  name: string;

  @Column('decimal', {
    precision: 10,
    scale: 2
  })
  value: number;

  @Column('uuid')
  productId: string;

  @ManyToOne(() => Product, product => product.prices)
  @JoinColumn({ name: 'productId' })
  product: Product;
}
