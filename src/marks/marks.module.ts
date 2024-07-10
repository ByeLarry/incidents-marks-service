import { Module } from '@nestjs/common';
import { MarksService } from './marks.service';
import { MarksGateway } from './marks.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mark } from './entities/mark.entity';
import { Category } from './entities/category.entity';
import { MarksController } from './marks.controller';
import { Verification } from './entities/verification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mark, Category, Verification])],
  controllers: [MarksController],
  providers: [MarksGateway, MarksService],
})
export class MarksModule {}
