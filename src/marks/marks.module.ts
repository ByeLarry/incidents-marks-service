import { Module } from '@nestjs/common';
import { MarksService } from './marks.service';
import { MarksGateway } from './marks.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mark } from './entities/mark.entity';
import { Category } from './entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mark, Category])],
  providers: [MarksGateway, MarksService],
})
export class MarksModule {}
