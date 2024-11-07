import {
  HttpStatus,
  Inject,
  Injectable,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { CategoryDto, MicroserviceResponseStatus } from '../marks/dto';
import {
  MicroserviceResponseStatusFabric,
  SEARCH_SERVICE_TAG,
} from '../libs/utils';
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
import { ClientProxy } from '@nestjs/microservices';
import { MsgSearchEnum } from '../libs/enums';
import { AppLoggerService } from '../libs/helpers';
import { firstValueFrom } from 'rxjs';

type AsyncFunction<T> = () => Promise<T>;

@Injectable()
export class CategoriesService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRep: Repository<Category>,
    @InjectRepository(Mark)
    private readonly markRep: Repository<Mark>,
    @Inject(SEARCH_SERVICE_TAG) private searchClient: ClientProxy,
    private readonly logger: AppLoggerService,
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

      const res = await firstValueFrom(
        this.searchClient.send(MsgSearchEnum.SET_CATEGORIES, categories),
      );

      this.logger.log(`[${MsgSearchEnum.SET_CATEGORIES}] - ${res}`);
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
