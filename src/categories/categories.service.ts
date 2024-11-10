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

type AsyncFunction<T> = () => Promise<T>;

@Injectable()
export class CategoriesService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRep: Repository<Category>,
    @InjectRepository(Mark)
    private readonly markRep: Repository<Mark>,
    private readonly searchService: SearchService,
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

  async onApplicationBootstrap() {
    return await this.handleAsyncOperation(async () => {
      const categories = await this.findAll();

      if (isArray(categories) && categories.length === 0) return;

      this.searchService.update(
        categories as CategoryDto[],
        MsgSearchEnum.SET_CATEGORIES,
      );
    });
  }

  async findAll() {
    return await this.handleAsyncOperation(async () => {
      const categories: CategoryDto[] = await this.categoryRep.find({
        select: ['id', 'name', 'color', 'createdAt', 'updatedAt'],
      });

      return categories;
    });
  }

  async createCategory(data: CreateCategoryDto) {
    return await this.handleAsyncOperation(async () => {
      const category = new Category();
      category.name = data.name;
      category.color = data.color;
      const newCategory = await this.categoryRep.save(category);

      await this.searchService.update(newCategory, MsgSearchEnum.SET_CATEGORY);

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
      await this.markRep.delete({ category });

      Promise.all([
        await this.categoryRep.delete({ id: data.id }),
        await this.searchService.update(
          category,
          MsgSearchEnum.DELETE_CATEGORY,
        ),
      ]);
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

      await this.searchService.update(newCategory, MsgSearchEnum.SET_CATEGORY);
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

  async searchCategories(data: SearchDto) {
    return await this.handleAsyncOperation(async () => {
      const res = await this.searchService.search<
        SearchDto,
        CategoriesSearchDto[]
      >(data, MsgSearchEnum.SEARCH_CATEGORIES);

      return this.categoryRep.find({
        select: ['id', 'name', 'color'],
        where: {
          id: In(res.map((el) => el.id)),
        },
      });
    });
  }
}
