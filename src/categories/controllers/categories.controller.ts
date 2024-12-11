import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MsgCategoriesEnum } from '../../libs/enums';
import {
  CategoriesPaginationDto,
  CreateCategoryDto,
  DeleteCategoryDto,
  UpdateCategoryDto,
} from '../dto';
import { CategoriesService } from '../services';

@Controller()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @MessagePattern(MsgCategoriesEnum.CATEGORIES)
  getAllCategories() {
    return this.categoriesService.getAllCategories();
  }

  @MessagePattern(MsgCategoriesEnum.CATEGORIES_PAGINATION)
  getAllCategoriesWithPagination(@Payload() dto: CategoriesPaginationDto) {
    return this.categoriesService.getAllCategoriesWithPagination(dto);
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
}
