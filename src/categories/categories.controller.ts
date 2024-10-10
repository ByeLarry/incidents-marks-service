import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { CategoriesService } from './categories.service';
import { MsgMarksEnum } from '../libs/enums';

@Controller()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @MessagePattern(MsgMarksEnum.CATEGORIES)
  findAll() {
    return this.categoriesService.findAll();
  }
}
