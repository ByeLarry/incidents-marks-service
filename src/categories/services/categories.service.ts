import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, Repository } from 'typeorm';
import { CategoriesSortEnum, MsgSearchEnum } from '../../libs/enums';
import { handleAsyncOperation } from '../../libs/helpers';
import { SearchService } from '../../libs/services';
import { MicroserviceResponseStatusFabric } from '../../libs/utils';
import { Mark } from '../../marks/entities';
import {
  CreateCategoryDto,
  DeleteCategoryDto,
  UpdateCategoryDto,
  CategoriesStatsDto,
  CategoriesPaginationDto,
} from '../dto';
import { Category } from '../entities';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRep: Repository<Category>,
    @InjectRepository(Mark)
    private readonly markRep: Repository<Mark>,
    private readonly searchService: SearchService,
  ) {}

  private async findCategoryById(id: number): Promise<Category | null> {
    return this.categoryRep.findOne({ where: { id } });
  }

  async getAllCategoriesWithPagination(dto: CategoriesPaginationDto) {
    return handleAsyncOperation(async () => {
      const total = await this.categoryRep.count();
      const categories = await this.categoryRep.find({
        select: ['id', 'name', 'color', 'createdAt', 'updatedAt'],
        take: dto.limit,
        skip: (dto.page - 1) * dto.limit,
        order: this.getSortOrder(dto.sort),
      });
      return {
        total,
        page: dto.page,
        limit: dto.limit,
        categories,
      };
    });
  }

  async getAllCategories() {
    return handleAsyncOperation(() =>
      this.categoryRep.find({
        select: ['id', 'name', 'color', 'createdAt', 'updatedAt'],
      }),
    );
  }

  async createCategory(data: CreateCategoryDto) {
    return handleAsyncOperation(async () => {
      const category = this.categoryRep.create(data);
      const newCategory = await this.categoryRep.save(category);

      await this.searchService.update(newCategory, MsgSearchEnum.SET_CATEGORY);
      return newCategory;
    });
  }

  async deleteCategory(data: DeleteCategoryDto) {
    return handleAsyncOperation(async () => {
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
    return handleAsyncOperation(async () => {
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
    return handleAsyncOperation(async () => {
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

  private getSortOrder(
    sortKey: CategoriesSortEnum,
  ): FindOptionsOrder<Category> {
    switch (sortKey) {
      case CategoriesSortEnum.CREATED_AT_ASC:
        return {
          ['createdAt']: 'ASC',
        };
      case CategoriesSortEnum.CREATED_AT_DESC:
        return {
          ['createdAt']: 'DESC',
        };
      default:
        return {
          ['createdAt']: 'ASC',
        };
    }
  }
}
