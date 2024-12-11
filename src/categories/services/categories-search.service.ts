import { HttpStatus, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { SearchDto } from '../../libs/dto';
import { MsgSearchEnum } from '../../libs/enums';
import { handleAsyncOperation } from '../../libs/helpers';
import { MicroserviceResponseStatusFabric } from '../../libs/utils';
import { CategoriesSearchDto, CategoryDto } from '../dto';
import { SearchService } from '../../libs/services';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../entities';
import { CategoriesService } from './categories.service';

@Injectable()
export class CategoriesSearchService implements OnApplicationBootstrap {
  constructor(
    private readonly searchService: SearchService,
    @InjectRepository(Category)
    private readonly categoryRep: Repository<Category>,
    private readonly categoriesService: CategoriesService,
  ) {}

  async onApplicationBootstrap() {
    await this.reindexSearchEngine();
  }

  async searchCategories(data: SearchDto) {
    return handleAsyncOperation(async () => {
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
    return handleAsyncOperation(async () => {
      const categories = await this.categoriesService.getAllCategories();
      if (!Array.isArray(categories) || categories.length === 0) {
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
