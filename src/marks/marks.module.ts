import { Logger, Module } from '@nestjs/common';
import { MarksService } from './marks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mark } from './entities/mark.entity';
import { MarksController } from './marks.controller';
import { Verification } from './entities/verification.entity';
import { CustomSqlQueryService } from '../libs/services/custom-sql-query.service';
import { MarkCleanupService } from '../libs/services/mark-cleanup.service';
import { AppLoggerService } from '../libs/helpers';

@Module({
  imports: [TypeOrmModule.forFeature([Mark, Verification])],
  controllers: [MarksController],
  providers: [
    MarksService,
    MarkCleanupService,
    CustomSqlQueryService,
    AppLoggerService,
    Logger,
  ],
})
export class MarksModule {}
