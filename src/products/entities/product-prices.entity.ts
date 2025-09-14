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
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value)
    }
  })
  value: number;

  @Column('decimal', {
    precision: 5,
    scale: 2,
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => value ? parseFloat(value) : null
    }
  })
  discountPercentage: number;

  @Column('boolean', {
    default: true
  })
  state: boolean;

  @Column('uuid')
  productId: string;

  @ManyToOne(() => Product, product => product.prices)
  @JoinColumn({ name: 'productId' })
  product: Product;
}
