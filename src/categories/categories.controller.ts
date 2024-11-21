import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, DeleteCategoryDto, UpdateCategoryDto } from './dto';
import { MsgCategoriesEnum } from '../libs/enums';
import { SearchDto } from '../libs/dto';

@Controller()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @MessagePattern(MsgCategoriesEnum.CATEGORIES)
  findAll() {
    return this.categoriesService.findAllCategories();
  }

  @MessagePattern(MsgCategoriesEnum.CREATE_CATEGORY)
  createCategory(@Payload() dto: CreateCategoryDto) {
    return this.categoriesService.createCategory(dto);
  }

  @MessagePattern(MsgCategoriesEnum.DELETE_CATEGORY)
  deleteCategoryDto(@Payload() dto: DeleteCategoryDto) {
    return this.categoriesService.deleteCategory(dto);
  }

  @MessagePattern(MsgCategoriesEnum.UPDATE_CATEGORY)
  updateCategoryDto(@Payload() dto: UpdateCategoryDto) {
    return this.categoriesService.updateCategory(dto);
  }

  @MessagePattern(MsgCategoriesEnum.CATEGORIES_STATS)
  getCategoriesStats() {
    return this.categoriesService.getCategoriesStats();
  }

  @MessagePattern(MsgCategoriesEnum.SEARCH_CATEGORIES)
  searchCategories(@Payload() dto: SearchDto) {
    return this.categoriesService.searchCategories(dto);
  }

  @MessagePattern(MsgCategoriesEnum.REINDEX)
  async reindexSearhchEngine() {
    return this.categoriesService.reindexSearchEngine();
  }
}
