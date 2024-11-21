import { HttpStatus, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { CategoryDto, MicroserviceResponseStatus } from '../marks/dto';
import { MicroserviceResponseStatusFabric } from '../libs/utils';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Category } from './entities';
import {
  CategoriesSearchDto,
  CategoriesStatsDto,
  CreateCategoryDto,
  DeleteCategoryDto,
  UpdateCategoryDto,
} from './dto';
import { Mark } from '../marks/entities';
import { MsgSearchEnum } from '../libs/enums';
import { SearchService } from '../libs/services';
import { SearchDto } from '../libs/dto';
import { isArray } from 'class-validator';
import { AppLoggerService } from '../libs/helpers';

type AsyncFunction<T> = () => Promise<T>;

@Injectable()
export class CategoriesService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRep: Repository<Category>,
    @InjectRepository(Mark)
    private readonly markRep: Repository<Mark>,
    private readonly searchService: SearchService,
    private readonly logger: AppLoggerService
  ) {}

  private async handleAsyncOperation<T>(
    operation: AsyncFunction<T>,
  ): Promise<T | MicroserviceResponseStatus> {
    try {
      return await operation();
    } catch (error) {
      this.logger.error(`Message - ${error.message}`);
      return MicroserviceResponseStatusFabric.create(
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }

  private async findCategoryById(id: number): Promise<Category | null> {
    return this.categoryRep.findOne({ where: { id } });
  }

  async onApplicationBootstrap() {
    await this.reindexSearchEngine();
  }

  async findAllCategories() {
    return this.handleAsyncOperation(() =>
      this.categoryRep.find({
        select: ['id', 'name', 'color', 'createdAt', 'updatedAt'],
      }),
    );
  }

  async createCategory(data: CreateCategoryDto) {
    return this.handleAsyncOperation(async () => {
      const category = this.categoryRep.create(data);
      const newCategory = await this.categoryRep.save(category);

      await this.searchService.update(newCategory, MsgSearchEnum.SET_CATEGORY);
      return newCategory;
    });
  }

  async deleteCategory(data: DeleteCategoryDto) {
    return this.handleAsyncOperation(async () => {
      const category = await this.findCategoryById(data.id);
      if (!category) {
        return MicroserviceResponseStatusFabric.create(HttpStatus.NOT_FOUND);
      }

      await this.markRep.delete({ category });
      await this.categoryRep.delete({ id: data.id });

      await this.searchService.update(category, MsgSearchEnum.DELETE_CATEGORY);

      return category;
    });
  }

  async updateCategory(data: UpdateCategoryDto) {
    return this.handleAsyncOperation(async () => {
      const category = await this.findCategoryById(data.id);
      if (!category) {
        return MicroserviceResponseStatusFabric.create(HttpStatus.NOT_FOUND);
      }

      Object.assign(category, data);
      const updatedCategory = await this.categoryRep.save(category);

      await this.searchService.update(
        updatedCategory,
        MsgSearchEnum.SET_CATEGORY,
      );
      return updatedCategory;
    });
  }

  async getCategoriesStats() {
    return this.handleAsyncOperation(async () => {
      const categories = await this.categoryRep.find({
        select: ['id', 'name'],
      });

      const stats: CategoriesStatsDto = {
        incidents: [],
        total: 0,
      };

      for (const category of categories) {
        const incidentsCount = await this.markRep.count({
          where: { category },
        });

        stats.incidents.push({
          id: category.id,
          name: category.name,
          incidentsCount,
        });
        stats.total += incidentsCount;
      }

      return stats;
    });
  }

  async searchCategories(data: SearchDto) {
    return this.handleAsyncOperation(async () => {
      const results = await this.searchService.search<
        SearchDto,
        CategoriesSearchDto[]
      >(data, MsgSearchEnum.SEARCH_CATEGORIES);

      if (!results || results.length === 0) {
        return MicroserviceResponseStatusFabric.create(HttpStatus.NOT_FOUND);
      }

      return this.categoryRep.find({
        where: {
          id: In(results.map((el) => el.id)),
        },
      });
    });
  }

  async reindexSearchEngine() {
    return this.handleAsyncOperation(async () => {
      const categories = await this.findAllCategories();
      if (!isArray(categories) || categories.length === 0) {
        return MicroserviceResponseStatusFabric.create(HttpStatus.NOT_FOUND);
      }

      await this.searchService.update(
        categories as CategoryDto[],
        MsgSearchEnum.SET_CATEGORIES,
      );

      return MicroserviceResponseStatusFabric.create(HttpStatus.NO_CONTENT);
    });
  }
}
