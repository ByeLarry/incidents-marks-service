import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CategoriesService } from './categories.service';
import { MsgMarksEnum } from '../libs/enums';
import { CreateCategoryDto, DeleteCategoryDto, UpdateCategoryDto } from './dto';

@Controller()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @MessagePattern(MsgMarksEnum.CATEGORIES)
  findAll() {
    return this.categoriesService.findAll();
  }

  @MessagePattern(MsgMarksEnum.CREATE_CATEGORY)
  createCategory(@Payload() dto: CreateCategoryDto) {
    return this.categoriesService.createCategory(dto);
  }

  @MessagePattern(MsgMarksEnum.DELETE_CATEGORY)
  deleteCategoryDto(@Payload() dto: DeleteCategoryDto) {
    return this.categoriesService.deleteCategory(dto);
  }

  @MessagePattern(MsgMarksEnum.UPDATE_CATEGORY)
  updateCategoryDto(@Payload() dto: UpdateCategoryDto) {
    return this.categoriesService.updateCategory(dto);
  }

  @MessagePattern(MsgMarksEnum.CATEGORIES_STATS)
  getCategoriesStats() {
    return this.categoriesService.getCategoriesStats();
  }
}
