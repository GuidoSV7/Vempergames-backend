import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
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
}
