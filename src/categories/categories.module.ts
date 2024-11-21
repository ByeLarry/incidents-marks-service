import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities';
import { Mark } from '../marks/entities';
import { SearchServiceProvide } from '../libs/utils';
import { AppLoggerService } from '../libs/helpers';
import { SearchService } from '../libs/services';
import { CategoriesSearchService, CategoriesService } from './services';
import { CategoriesController } from './controllers';
import { CategoriesSearchController } from './controllers/categories-search.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Mark])],
  controllers: [CategoriesController, CategoriesSearchController],
  providers: [
    CategoriesService,
    SearchServiceProvide,
    AppLoggerService,
    SearchService,
    CategoriesSearchService,
  ],
})
export class CategoriesModule {}
