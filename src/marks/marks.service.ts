import { HttpStatus, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, MoreThanOrEqual, Repository } from 'typeorm';

import { Mark } from './entities/mark.entity';
import { Verification } from './entities/verification.entity';
import { Category } from '../categories/entities';

import {
  CoordsDto,
  VerifyMarkDto,
  MarkDto,
  MarkRecvDto,
  CreateMarkDto,
  MicroserviceResponseStatus,
} from './dto';
import { MicroserviceResponseStatusFabric } from '../libs/utils';
import { CustomSqlQueryService, SearchService } from '../libs/services';
import { ConfigService } from '@nestjs/config';
import { MsgSearchEnum } from '../libs/enums';
import { MarksSearchDto } from './dto';
import { SearchDto } from '../libs/dto';
import { AppLoggerService } from '../libs/helpers';

@Injectable()
export class MarksService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Mark) private readonly markRep: Repository<Mark>,
    @InjectRepository(Verification)
    private readonly verificationRep: Repository<Verification>,
    private readonly dataSource: DataSource,
    private readonly customSqlQueryService: CustomSqlQueryService,
    private readonly configService: ConfigService,
    private readonly searchService: SearchService,
    private readonly logger: AppLoggerService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.reindexSearchEngine();
  }

  private async handleTransaction<T>(
    operation: (queryRunner: any) => Promise<T>,
  ): Promise<T | MicroserviceResponseStatus> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await operation(queryRunner);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return MicroserviceResponseStatusFabric.create(
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    } finally {
      await queryRunner.release();
    }
  }

  private createMarkRecvDto(mark: Mark): MarkRecvDto {
    return {
      id: mark.id,
      lat: mark.lat,
      lng: mark.lng,
      categoryId: mark.category.id,
      color: mark.category.color,
      addressDescription: mark.addressDescription,
      addressName: mark.addressName,
    };
  }

  async getNearestMarks(
    data: CoordsDto,
  ): Promise<MarkRecvDto[] | MicroserviceResponseStatus> {
    return this.handleOperation(async () => {
      const schema = this.configService.get('DB_SCHEMA') || 'public';
      const query = this.customSqlQueryService.getNearestPoints(schema);
      return await this.markRep.query(query, [data.lng, data.lat]);
    });
  }

  async getMark(
    data: MarkDto,
  ): Promise<MarkRecvDto | MicroserviceResponseStatus> {
    return this.handleOperation(async () => {
      const mark = await this.markRep.findOne({
        where: { id: Number(data.markId) },
        relations: ['category'],
      });
      if (!mark)
        return MicroserviceResponseStatusFabric.create(HttpStatus.NOT_FOUND);

      const [verifiedCount, distance] = await Promise.all([
        this.verificationRep.count({
          where: { mark: { id: Number(data.markId) } },
        }),
        this.getDistance(data.lat, data.lng, Number(data.markId)),
      ]);

      const userVerification = await this.verificationRep.findOne({
        where: { mark: { id: Number(data.markId) }, userId: data.userId },
      });

      return {
        ...mark,
        categoryId: mark.category.id,
        verified: verifiedCount,
        isMyVerify: !!userVerification,
        distance: distance,
      };
    });
  }

  async verifyMark(
    data: VerifyMarkDto,
    isTrue: boolean,
  ): Promise<{ verified: number } | MicroserviceResponseStatus> {
    return this.handleTransaction(async (queryRunner) => {
      const mark = await queryRunner.manager.findOne(Mark, {
        where: { id: data.markId },
      });
      if (!mark)
        return MicroserviceResponseStatusFabric.create(HttpStatus.NOT_FOUND);

      if (isTrue) {
        const verification = queryRunner.manager.create(Verification, {
          mark,
          userId: data.userId,
          createdAt: new Date(),
        });
        await queryRunner.manager.save(verification);
      } else {
        await queryRunner.manager.delete(Verification, {
          mark: { id: data.markId },
        });
      }

      const verifiedCount = await queryRunner.manager.count(Verification, {
        where: { mark: { id: data.markId } },
      });
      return { verified: verifiedCount };
    });
  }

  async createMark(
    data: CreateMarkDto,
  ): Promise<MarkRecvDto | MicroserviceResponseStatus> {
    return this.handleTransaction(async (queryRunner) => {
      const schema = this.configService.get('DB_SCHEMA') || 'public';
      const [category, existingMarks] = await Promise.all([
        queryRunner.manager.findOne(Category, {
          where: { id: data.categoryId },
        }),
        queryRunner.manager.query(
          this.customSqlQueryService.checkApproximateDistance(schema),
          [data.lng, data.lat, 25],
        ),
      ]);

      if (!category)
        return MicroserviceResponseStatusFabric.create(HttpStatus.NOT_FOUND);
      if (existingMarks.length > 0)
        return MicroserviceResponseStatusFabric.create(HttpStatus.CONFLICT);

      const countLastTwelveHoursMarks = await this.countUserMarksLast12Hours(
        queryRunner,
        data.userId,
      );
      if (countLastTwelveHoursMarks >= 5)
        return MicroserviceResponseStatusFabric.create(
          HttpStatus.TOO_MANY_REQUESTS,
        );

      const mark = queryRunner.manager.create(Mark, {
        ...data,
        category,
        addressName: data.address.name,
        addressDescription: data.address.description,
      });
      await queryRunner.manager.save(mark);
      this.searchService.update(mark, MsgSearchEnum.SET_MARK);

      return this.createMarkRecvDto(mark);
    });
  }

  async getAllMarks(): Promise<Mark[]> {
    return this.handleOperation(async () => {
      const schema = this.configService.get('DB_SCHEMA') || 'public';
      return await this.markRep.query(
        this.customSqlQueryService.getAllPoints(schema),
      );
    });
  }

  async deleteMarkById(id: number) {
    return this.handleTransaction(async (queryRunner) => {
      const mark = await queryRunner.manager.findOne(Mark, { where: { id } });
      if (!mark)
        return MicroserviceResponseStatusFabric.create(HttpStatus.NOT_FOUND);

      await queryRunner.manager.delete(Mark, { id });
      this.searchService.update(mark, MsgSearchEnum.DELETE_MARK);

      return this.createMarkRecvDto(mark);
    });
  }

  async searchMarks(
    data: SearchDto,
  ): Promise<Mark[] | MicroserviceResponseStatus> {
    return this.handleOperation(async () => {
      const result = await this.searchService.search<
        SearchDto,
        MarksSearchDto[]
      >(data, MsgSearchEnum.SEARCH_MARKS);
      if (!result)
        return MicroserviceResponseStatusFabric.create(HttpStatus.NOT_FOUND);

      return this.markRep.find({
        select: ['id', 'title', 'category', 'lat', 'lng'],
        where: { id: In(result.map((el) => el.id)) },
      });
    });
  }

  async reindexSearchEngine(): Promise<MicroserviceResponseStatus> {
    return this.handleOperation(async () => {
      const marks = await this.markRep
        .createQueryBuilder('mark')
        .select([
          'mark.id',
          'mark.lat',
          'mark.lng',
          'mark.addressDescription',
          'mark.addressName',
        ])
        .getMany();

      if (marks.length === 0)
        return MicroserviceResponseStatusFabric.create(HttpStatus.NOT_FOUND);

      this.searchService.update(marks, MsgSearchEnum.SET_MARKS);
      return MicroserviceResponseStatusFabric.create(HttpStatus.NO_CONTENT);
    });
  }

  private async handleOperation<T>(
    operation: () => Promise<T>,
  ): Promise<T | MicroserviceResponseStatus> {
    try {
      return await operation();
    } catch (error) {
      this.logger.error(`Message - ${error.message}`);
      return MicroserviceResponseStatusFabric.create(
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }

  private async countUserMarksLast12Hours(
    queryRunner: any,
    userId: string,
  ): Promise<number> {
    const twelveHoursAgo = new Date();
    twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

    return queryRunner.manager.count(Mark, {
      where: { userId, createdAt: MoreThanOrEqual(twelveHoursAgo) },
    });
  }

  private async getDistance(
    lat: number,
    lng: number,
    markId: number,
  ): Promise<number> {
    const schema = this.configService.get('DB_SCHEMA') || 'public';
    const distances = await this.markRep.query(
      this.customSqlQueryService.getDistance(schema),
      [lat, lng, markId],
    );
    return distances[0]?.distance || 0;
  }
}
