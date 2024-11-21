import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MsgCategoriesEnum } from '../../libs/enums';
import {
  CreateCategoryDto,
  DeleteCategoryDto,
  UpdateCategoryDto,
} from '../dto';
import { CategoriesService } from '../services';

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

}
