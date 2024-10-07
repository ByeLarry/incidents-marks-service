import { HttpStatus, Injectable } from '@nestjs/common';
import { CoordsDto } from './dto/coords.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Mark } from './entities/mark.entity';
import { Category } from './entities/category.entity';
import { DataSource, MoreThanOrEqual, Repository } from 'typeorm';

import { VerifyMarkDto } from './dto/verify-mark.dto';
import { Verification } from './entities/verification.entity';
import { MarkDto } from './dto/mark.dto';
import { CategoryDto } from './dto/categories.dto';
import { MarkRecvDto } from './dto/mark-recv.dto';
import { CreateMarkDto } from './dto/create-mark.dto';
import { MicroserviceResponseStatus } from './dto/microservice-response-status.dto';
import { MicroserviceResponseStatusFabric } from '../libs/utils/microservice-response-status-fabric.util';
import { CustomSqlQueryService } from '../libs/services/custom-sql-query.service';
import { ConfigService } from '@nestjs/config';

type AsyncFunction<T> = () => Promise<T>;

@Injectable()
export class MarksService {
  constructor(
    @InjectRepository(Mark) private readonly markRep: Repository<Mark>,
    @InjectRepository(Category)
    private readonly categoryRep: Repository<Category>,
    @InjectRepository(Verification)
    private readonly verificationRep: Repository<Verification>,
    private readonly dataSource: DataSource,
    private readonly customSqlQueryService: CustomSqlQueryService,
    private readonly configService: ConfigService,
  ) {}

  private async handleAsyncOperation<T>(
    operation: AsyncFunction<T>,
  ): Promise<T | MicroserviceResponseStatus> {
    try {
      return await operation();
    } catch (error) {
      console.log(error);
      const res = MicroserviceResponseStatusFabric.create(
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
      return res;
    }
  }

  async getMarks(
    data: CoordsDto,
  ): Promise<MarkRecvDto[] | MicroserviceResponseStatus> {
    return await this.handleAsyncOperation(
      async () =>
        await this.markRep.query(
          this.customSqlQueryService.getNearestPoints(
            this.configService.get('DB_SCHEMA') || 'public',
          ),
          [data.lng, data.lat],
        ),
    );
  }

  async getMark(
    data: MarkDto,
  ): Promise<MarkRecvDto | MicroserviceResponseStatus> {
    return await this.handleAsyncOperation(async () => {
      const mark = await this.markRep.findOne({
        where: { id: Number(data.markId) },
        relations: ['category'],
      });
      if (!mark)
        return MicroserviceResponseStatusFabric.create(HttpStatus.NOT_FOUND);

      const verified = await this.verificationRep.count({
        where: { mark: { id: Number(data.markId) } },
      });

      const distance: Array<{ distance: number }> = await this.markRep.query(
        this.customSqlQueryService.getDistance(
          this.configService.get('DB_SCHEMA') || 'public',
        ),
        [data.lat, data.lng, data.markId],
      );

      const userVerification = await this.verificationRep.findOne({
        where: {
          mark: { id: Number(data.markId) },
          userId: data.userId,
        },
      });
      return {
        ...mark,
        categoryId: mark.category.id,
        verified,
        isMyVerify: !!userVerification,
        distance: distance[0].distance,
      };
    });
  }

  async verifyTrue(
    data: VerifyMarkDto,
  ): Promise<{ verified: number } | MicroserviceResponseStatus> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const result = await this.handleAsyncOperation(async () => {
      const mark = await queryRunner.manager.findOne(Mark, {
        where: { id: data.markId },
      });

      if (!mark) {
        await queryRunner.rollbackTransaction();
        return MicroserviceResponseStatusFabric.create(HttpStatus.NOT_FOUND);
      }

      const newVerification = new Verification();
      newVerification.mark = mark;
      newVerification.userId = data.userId;
      newVerification.createdAt = new Date();
      await queryRunner.manager.save(newVerification);

      const verified = await queryRunner.manager.count(Verification, {
        where: { mark: { id: Number(data.markId) } },
      });

      await queryRunner.commitTransaction();
      return { verified };
    });
    await queryRunner.release();
    return result;
  }

  async verifyFalse(
    data: VerifyMarkDto,
  ): Promise<{ verified: number } | MicroserviceResponseStatus> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const result = await this.handleAsyncOperation(async () => {
      const mark = await queryRunner.manager.findOne(Mark, {
        where: { id: data.markId },
      });

      if (!mark) {
        queryRunner.rollbackTransaction();
        return MicroserviceResponseStatusFabric.create(HttpStatus.NOT_FOUND);
      }

      await queryRunner.manager.delete(Verification, {
        mark: { id: data.markId },
      });

      const verified = await queryRunner.manager.count(Verification, {
        where: { mark: { id: Number(data.markId) } },
      });

      await queryRunner.commitTransaction();
      return { verified };
    });
    await queryRunner.release();
    return result;
  }

  async getCategories(): Promise<CategoryDto[] | MicroserviceResponseStatus> {
    return await this.handleAsyncOperation(async () => {
      const categories: CategoryDto[] = await this.categoryRep.find({
        select: ['id', 'name', 'color'],
      });

      if (!categories)
        return MicroserviceResponseStatusFabric.create(HttpStatus.NOT_FOUND);
      return categories;
    });
  }

  async createMark(
    data: CreateMarkDto,
  ): Promise<MarkRecvDto | MicroserviceResponseStatus> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const result = await this.handleAsyncOperation(async () => {
      const category = await queryRunner.manager.findOne(Category, {
        where: { id: data.categoryId },
      });

      if (!category) {
        await queryRunner.rollbackTransaction();
        return MicroserviceResponseStatusFabric.create(HttpStatus.NOT_FOUND);
      }

      const checkMark = await queryRunner.manager.query(
        this.customSqlQueryService.checkApproximateDistance(
          this.configService.get('DB_SCHEMA') || 'public',
        ),
        [data.lng, data.lat, 25],
      );

      if (checkMark.length > 0) {
        await queryRunner.rollbackTransaction();
        return MicroserviceResponseStatusFabric.create(HttpStatus.CONFLICT);
      }

      const twelveHoursAgo = new Date();
      twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

      const countLastTwelveHoursMarks = await queryRunner.manager.count(Mark, {
        where: {
          userId: data.userId,
          createdAt: MoreThanOrEqual(twelveHoursAgo),
        },
      });

      if (countLastTwelveHoursMarks >= 5) {
        await queryRunner.rollbackTransaction();
        return MicroserviceResponseStatusFabric.create(
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      const mark = new Mark();
      mark.lat = data.lat;
      mark.lng = data.lng;
      mark.title = data.title;
      mark.description = data.description;
      mark.userId = data.userId;
      mark.category = category;
      await queryRunner.manager.save(mark);
      await queryRunner.commitTransaction();
      const markRecv: MarkRecvDto = {
        id: mark.id,
        lat: mark.lat,
        lng: mark.lng,
        categoryId: mark.category.id,
        color: mark.category.color,
      };
      return markRecv;
    });
    await queryRunner.release();
    return result;
  }
}
