import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { Category } from './entities/category.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class CategoriesService {
    private readonly logger = new Logger('CategoriesService');

    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
        private readonly dataSource: DataSource,
    ) {}

    async create(createCategoryDto: CreateCategoryDto) {
        try {
            const category = this.categoryRepository.create(createCategoryDto);
            const savedCategory = await this.categoryRepository.save(category);
            
            return this.findOne(savedCategory.id);
        } catch (error) {
            this.logger.error(error.message);
            throw new InternalServerErrorException('Error creating category');
        }
    }

    findAll(paginationDto: PaginationDto) {
        const { limit = 10, offset = 0 } = paginationDto;
        return this.categoryRepository.find({
            where: { state: true }, // Solo categorías activas
            take: limit,
            skip: offset,
            order: { name: 'ASC' }
        });
    }

    findAllWithAllStates(paginationDto: PaginationDto) {
        const { limit = 10, offset = 0 } = paginationDto;
        return this.categoryRepository.find({
            take: limit,
            skip: offset,
            order: { name: 'ASC' }
        });
    }

    async findOne(id: string) {
        const category = await this.categoryRepository
            .createQueryBuilder('category')
            .leftJoinAndSelect('category.products', 'products')
            .where('category.id = :id', { id })
            .getOne();

        if (!category) {
            throw new NotFoundException(`Category with id ${id} not found`);
        }

        return category;
    }

    async update(id: string, updateCategoryDto: UpdateCategoryDto) {
        // First check if the category exists
        const exists = await this.categoryRepository.findOne({ where: { id } });
        if (!exists) {
            throw new NotFoundException(`Category with id ${id} not found`);
        }

        // Create the update object
        const category = await this.categoryRepository.create({
            ...exists,
            ...updateCategoryDto,
        });

        // Create Query Runner
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await queryRunner.manager.save(category);
            await queryRunner.commitTransaction();
            return this.findOne(id);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException('Error updating category data');
        } finally {
            await queryRunner.release();
        }
    }

    async remove(id: string) {
        try {
            const category = await this.categoryRepository.findOne({ 
                where: { id } 
            });
            
            if (!category) {
                throw new NotFoundException(`Category with id ${id} not found`);
            }

            // Soft delete: cambiar state a false
            category.state = false;
            await this.categoryRepository.save(category);
            
            return {
                message: `Category with id ${id} was successfully deleted (soft delete).`,
                category
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Error while removing category');
        }
    }

    async restore(id: string) {
        try {
            const category = await this.categoryRepository.findOne({ 
                where: { id } 
            });
            
            if (!category) {
                throw new NotFoundException(`Category with id ${id} not found`);
            }

            if (category.state) {
                throw new InternalServerErrorException('Category is not deleted');
            }

            // Restaurar: cambiar state a true
            category.state = true;
            await this.categoryRepository.save(category);
            
            return {
                message: `Category with id ${id} was successfully restored.`,
                category
            };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
                throw error;
            }
            throw new InternalServerErrorException('Error while restoring category');
        }
    }

    async deleteAllCategories() {
        try {
            return await this.categoryRepository
                .createQueryBuilder('category')
                .delete()
                .execute();
        } catch (error) {
            this.logger.error(error.message);
            throw new InternalServerErrorException(error.message);
        }
    }
}
