import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mark } from './entities/mark.entity';
import { MarksController } from './controllers/marks.controller';
import { Verification } from './entities/verification.entity';
import { CustomSqlQueryService } from '../libs/services/custom-sql-query.service';
import { MarkCleanupService } from '../libs/services/mark-cleanup.service';
import { AppLoggerService } from '../libs/helpers';
import { SearchServiceProvide } from '../libs/utils';
import { SearchService } from '../libs/services';
import { MarksSearchService, MarksService } from './services';
import { MarksSearchController } from './controllers/marks-search.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Mark, Verification])],
  controllers: [MarksController, MarksSearchController],
  providers: [
    MarksService,
    MarkCleanupService,
    CustomSqlQueryService,
    AppLoggerService,
    SearchServiceProvide,
    SearchService,
    MarksSearchService,
  ],
})
export class MarksModule {}
