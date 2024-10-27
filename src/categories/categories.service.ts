import { HttpStatus, Injectable } from '@nestjs/common';
import { CategoryDto, MicroserviceResponseStatus } from '../marks/dto';
import { MicroserviceResponseStatusFabric } from '../libs/utils';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities';
import {
  CategoriesStatsDto,
  CreateCategoryDto,
  DeleteCategoryDto,
  UpdateCategoryDto,
} from './dto';
import { Mark } from '../marks/entities';

type AsyncFunction<T> = () => Promise<T>;

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRep: Repository<Category>,
    @InjectRepository(Mark)
    private readonly markRep: Repository<Mark>,
  ) {}

  private async handleAsyncOperation<T>(
    operation: AsyncFunction<T>,
  ): Promise<T | MicroserviceResponseStatus> {
    try {
      return await operation();
    } catch (error) {
      console.error(error);
      const res = MicroserviceResponseStatusFabric.create(
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
      return res;
    }
  }

  async findAll() {
    return await this.handleAsyncOperation(async () => {
      const categories: CategoryDto[] = await this.categoryRep.find({
        select: ['id', 'name', 'color', 'createdAt', 'updatedAt'],
      });

      if (!categories)
        return MicroserviceResponseStatusFabric.create(HttpStatus.NOT_FOUND);
      return categories;
    });
  }

  async createCategory(data: CreateCategoryDto) {
    return await this.handleAsyncOperation(async () => {
      const category = new Category();
      category.name = data.name;
      category.color = data.color;
      const newCategory = await this.categoryRep.save(category);
      return newCategory;
    });
  }

  async deleteCategory(data: DeleteCategoryDto) {
    return await this.handleAsyncOperation(async () => {
      const category = await this.categoryRep.findOne({
        where: { id: data.id },
      });
      if (!category)
        return MicroserviceResponseStatusFabric.create(HttpStatus.NOT_FOUND);
      await this.categoryRep.delete({ id: data.id });
      return category;
    });
  }

  async updateCategory(data: UpdateCategoryDto) {
    return await this.handleAsyncOperation(async () => {
      const category = await this.categoryRep.findOne({
        where: { id: data.id },
      });
      if (!category)
        return MicroserviceResponseStatusFabric.create(HttpStatus.NOT_FOUND);
      category.name = data.name;
      category.color = data.color;
      const newCategory = await this.categoryRep.save(category);
      return newCategory;
    });
  }

  async getCategoriesStats() {
    return await this.handleAsyncOperation(async () => {
      const categories = await this.categoryRep.find({
        select: ['id', 'name'],
      });

      const stats: CategoriesStatsDto = {
        incidents: [],
        total: 0,
      };

      for (const category of categories) {
        const markCount = await this.markRep.count({
          where: { category },
        });

        stats.incidents.push({
          id: category.id,
          name: category.name,
          incidentsCount: markCount,
        });

        stats.total += markCount;
      }
      return stats;
    });
  }
}
