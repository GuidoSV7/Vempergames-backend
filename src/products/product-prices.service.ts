import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, Not, IsNull } from 'typeorm';
import { CreateProductPriceDto, UpdateProductPriceDto } from './dto';
import { ProductPrices } from './entities/product-prices.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class ProductPricesService {
    private readonly logger = new Logger('ProductPricesService');

    constructor(
        @InjectRepository(ProductPrices)
        private readonly productPriceRepository: Repository<ProductPrices>,
        private readonly dataSource: DataSource,
    ) {}

    async create(createProductPriceDto: CreateProductPriceDto) {
        try {
            const productPrice = this.productPriceRepository.create(createProductPriceDto);
            const savedProductPrice = await this.productPriceRepository.save(productPrice);
            
            return this.findOne(savedProductPrice.id);
        } catch (error) {
            this.logger.error(error.message);
            throw new InternalServerErrorException('Error creating product price');
        }
    }

    findAll(paginationDto: PaginationDto) {
        const { limit = 10, offset = 0 } = paginationDto;
        return this.productPriceRepository.find({
            relations: ['product'],
            take: limit,
            skip: offset,
        });
    }

    async findOne(id: string) {
        const productPrice = await this.productPriceRepository
            .createQueryBuilder('productPrice')
            .leftJoinAndSelect('productPrice.product', 'product')
            .where('productPrice.id = :id', { id })
            .getOne();

        if (!productPrice) {
            throw new NotFoundException(`Product price with id ${id} not found`);
        }

        return productPrice;
    }

    async findByProduct(productId: string) {
        try {
            return await this.productPriceRepository.find({
                where: { productId },
                relations: ['product'],
            });
        } catch (error) {
            this.logger.error(error.message);
            throw new InternalServerErrorException('Error finding product prices by product');
        }
    }

    async update(id: string, updateProductPriceDto: UpdateProductPriceDto) {
        // First check if the product price exists
        const exists = await this.productPriceRepository.findOne({ where: { id } });
        if (!exists) {
            throw new NotFoundException(`Product price with id ${id} not found`);
        }

        // Create the update object
        const productPrice = await this.productPriceRepository.create({
            ...exists,
            ...updateProductPriceDto,
        });

        // Create Query Runner
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await queryRunner.manager.save(productPrice);
            await queryRunner.commitTransaction();
            return this.findOne(id);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException('Error updating product price data');
        } finally {
            await queryRunner.release();
        }
    }

    async remove(id: string) {
        try {
            const productPrice = await this.productPriceRepository.findOne({ 
                where: { id } 
            });
            
            if (!productPrice) {
                throw new NotFoundException(`Product price with id ${id} not found`);
            }

            await this.productPriceRepository.remove(productPrice);
            
            return {
                message: `Product price with id ${id} was successfully deleted.`
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Error while removing product price');
        }
    }

    async deleteAllProductPrices() {
        try {
            return await this.productPriceRepository
                .createQueryBuilder('productPrice')
                .delete()
                .execute();
        } catch (error) {
            this.logger.error(error.message);
            throw new InternalServerErrorException(error.message);
        }
    }

    // Métodos para manejar ofertas
    async findActiveOffersByProduct(productId: string) {
        try {
            return await this.productPriceRepository.find({
                where: { 
                    productId,
                    state: true,
                    discountPercentage: Not(null)
                },
                relations: ['product'],
                order: { discountPercentage: 'DESC' }
            });
        } catch (error) {
            this.logger.error(error.message);
            throw new InternalServerErrorException('Error finding active offers by product');
        }
    }

    async findRegularPriceByProduct(productId: string) {
        try {
            return await this.productPriceRepository.findOne({
                where: { 
                    productId,
                    state: true,
                    discountPercentage: IsNull()
                },
                relations: ['product']
            });
        } catch (error) {
            this.logger.error(error.message);
            throw new InternalServerErrorException('Error finding regular price by product');
        }
    }

    async calculateFinalPrice(price: ProductPrices): Promise<number> {
        if (price.discountPercentage && price.discountPercentage > 0) {
            const finalPrice = price.value * (1 - price.discountPercentage / 100);
            return Math.round(finalPrice * 100) / 100; // Redondear a 2 decimales
        }
        return price.value;
    }

    async togglePriceState(id: string) {
        try {
            const price = await this.findOne(id);
            price.state = !price.state;
            return await this.productPriceRepository.save(price);
        } catch (error) {
            this.logger.error(error.message);
            throw new InternalServerErrorException('Error toggling price state');
        }
    }

    async findAllProductsWithOffers() {
        try {
            this.logger.log('Finding all products with offers...');
            
            const offers = await this.productPriceRepository.find({
                where: {
                    state: true,
                    discountPercentage: Not(0)
                },
                relations: ['product', 'product.category'],
                order: { discountPercentage: 'DESC' }
            });

            this.logger.log(`Found ${offers.length} offers in database`);

            // Agrupar por producto y tomar la mejor oferta de cada uno
            const productOffersMap = new Map();
            
            for (const offer of offers) {
                if (offer.discountPercentage > 0) {
                    const productId = offer.product.id;
                    const finalPrice = await this.calculateFinalPrice(offer);
                    
                    if (!productOffersMap.has(productId) || 
                        offer.discountPercentage > productOffersMap.get(productId).offerPrice.discountPercentage) {
                        
                        productOffersMap.set(productId, {
                            id: offer.product.id,
                            title: offer.product.title,
                            imageUrl: offer.product.imageUrl,
                            category: offer.product.category,
                            state: offer.product.state,
                            offerPrice: {
                                id: offer.id,
                                name: offer.name,
                                value: offer.value,
                                discountPercentage: offer.discountPercentage,
                                finalPrice: finalPrice,
                                state: offer.state
                            }
                        });
                    }
                }
            }

            const result = Array.from(productOffersMap.values());
            this.logger.log(`Returning ${result.length} products with offers`);
            return result;
        } catch (error) {
            this.logger.error('Error finding all products with offers:', error.message);
            throw new InternalServerErrorException('Error finding all products with offers');
        }
    }
}
