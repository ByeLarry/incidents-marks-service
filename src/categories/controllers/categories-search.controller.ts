import { Controller } from '@nestjs/common';
import { CategoriesSearchService } from '../services';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SearchDto } from '../../libs/dto';
import { MsgCategoriesEnum } from '../../libs/enums';

@Controller()
export class CategoriesSearchController {
  constructor(
    private readonly categoriesSearchService: CategoriesSearchService,
  ) {}

  @MessagePattern(MsgCategoriesEnum.SEARCH_CATEGORIES)
  searchCategories(@Payload() dto: SearchDto) {
    return this.categoriesSearchService.searchCategories(dto);
  }

  @MessagePattern(MsgCategoriesEnum.REINDEX)
  async reindexSearhchEngine() {
    return this.categoriesSearchService.reindexSearchEngine();
  }
}
