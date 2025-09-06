import { Injectable, InternalServerErrorException, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto, UpdateProductDto } from './dto';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class ProductsService {
    private readonly logger = new Logger('ProductsService');

    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        private readonly dataSource: DataSource,
    ) {}

    async create(createProductDto: CreateProductDto) {
        try {
            const product = this.productRepository.create(createProductDto);
            const savedProduct = await this.productRepository.save(product);
            
            return this.findOne(savedProduct.id);
        } catch (error) {
            this.logger.error(error.message);
            throw new InternalServerErrorException('Error creating product');
        }
    }

    async findAll(paginationDto: PaginationDto) {
        const { limit = 10, offset = 0 } = paginationDto;
        const products = await this.productRepository.find({
            where: { state: true }, // Only show active products
            relations: ['category'],
            take: limit,
            skip: offset,
        });

        // Transform products to exclude categoryId
        return products.map(product => {
            const { categoryId, ...productWithoutCategoryId } = product;
            return productWithoutCategoryId;
        });
    }

    async findOne(id: string) {
        const product = await this.productRepository.findOne({
            where: { id },
            relations: ['category']
        });

        if (!product) {
            throw new NotFoundException(`Product with id ${id} not found`);
        }

        // Transform the result to exclude categoryId but include category
        const { categoryId, ...productWithoutCategoryId } = product;
        return productWithoutCategoryId;
    }

    async update(id: string, updateProductDto: UpdateProductDto) {
        const { categoryId, ...toUpdate } = updateProductDto;

        // First check if the product exists
        const exists = await this.productRepository.findOne({ where: { id } });
        if (!exists) {
            throw new NotFoundException(`Product with id ${id} not found`);
        }

        // Create the update object
        const product = await this.productRepository.create({
            ...exists,
            ...toUpdate,
            category: categoryId ? { id: categoryId } : exists.category,
        });

        // Create Query Runner
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await queryRunner.manager.save(product);
            await queryRunner.commitTransaction();
            return this.findOne(id);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException('Error updating product data');
        } finally {
            await queryRunner.release();
        }
    }

    async remove(id: string) {
        try {
            const product = await this.productRepository.findOne({ 
                where: { id } 
            });
            
            if (!product) {
                throw new NotFoundException(`Product with id ${id} not found`);
            }

            // Soft delete: change state to false instead of removing
            product.state = false;
            await this.productRepository.save(product);
            
            return {
                message: `Product with id ${id} was successfully marked as inactive.`
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Error while marking product as deleted');
        }
    }

    async findByCategory(categoryId: string) {
        try {
            const products = await this.productRepository.find({
                where: { 
                    categoryId,
                    state: true // Only show active products
                },
                relations: ['category'],
            });

            // Transform products to exclude categoryId
            return products.map(product => {
                const { categoryId, ...productWithoutCategoryId } = product;
                return productWithoutCategoryId;
            });
        } catch (error) {
            this.logger.error(error.message);
            throw new InternalServerErrorException('Error finding products by category');
        }
    }

    async restore(id: string) {
        try {
            const product = await this.productRepository.findOne({ 
                where: { id } 
            });
            
            if (!product) {
                throw new NotFoundException(`Product with id ${id} not found`);
            }

            if (product.state !== false) {
                throw new BadRequestException(`Product with id ${id} is not inactive. Current state: ${product.state}`);
            }

            // Restore product: change state back to true (active)
            product.state = true;
            await this.productRepository.save(product);
            
            return {
                message: `Product with id ${id} was successfully activated.`,
                product: await this.findOne(id)
            };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Error while restoring product');
        }
    }

    async findAllWithAllStates(paginationDto: PaginationDto) {
        const { limit = 10, offset = 0 } = paginationDto;
        const products = await this.productRepository.find({
            relations: ['category'],
            take: limit,
            skip: offset,
        });

        // Transform products to exclude categoryId
        return products.map(product => {
            const { categoryId, ...productWithoutCategoryId } = product;
            return productWithoutCategoryId;
        });
    }

    async deleteAllProducts() {
        try {
            return await this.productRepository
                .createQueryBuilder('product')
                .delete()
                .execute();
        } catch (error) {
            this.logger.error(error.message);
            throw new InternalServerErrorException(error.message);
        }
    }
}
