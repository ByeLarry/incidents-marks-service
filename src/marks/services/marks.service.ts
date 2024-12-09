import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, MoreThanOrEqual } from 'typeorm';
import { Category } from '../../categories/entities';
import { MsgSearchEnum } from '../../libs/enums';
import { handleAsyncOperation } from '../../libs/helpers';
import { CustomSqlQueryService, SearchService } from '../../libs/services';
import { MicroserviceResponseStatusFabric } from '../../libs/utils';
import {
  MicroserviceResponseStatus,
  MarkRecvDto,
  CoordsDto,
  MarkDto,
  VerifyMarkDto,
  CreateMarkDto,
} from '../dto';
import { Mark, Verification } from '../entities';

@Injectable()
export class MarksService {
  constructor(
    @InjectRepository(Mark) private readonly markRep: Repository<Mark>,
    @InjectRepository(Verification)
    private readonly verificationRep: Repository<Verification>,
    private readonly dataSource: DataSource,
    private readonly customSqlQueryService: CustomSqlQueryService,
    private readonly searchService: SearchService,
  ) {}

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
    return handleAsyncOperation(async () => {
      const query = this.customSqlQueryService.getNearestPoints();
      return await this.markRep.query(query, [data.lng, data.lat]);
    });
  }

  async getMark(
    data: MarkDto,
  ): Promise<MarkRecvDto | MicroserviceResponseStatus> {
    return handleAsyncOperation(async () => {
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
      const [category, existingMarks] = await Promise.all([
        queryRunner.manager.findOne(Category, {
          where: { id: data.categoryId },
        }),
        queryRunner.manager.query(
          this.customSqlQueryService.checkApproximateDistance(),
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

  async getAllMarks(): Promise<Mark[] | MicroserviceResponseStatus> {
    return handleAsyncOperation(async () => {
      const marks = await this.markRep.find({
        relations: ['category'],
        select: ['lng', 'lat', 'id'],
      });

      const result: Mark[] = await Promise.all(
        marks.map(async (mark) => {
          return {
            ...mark,
            color: mark.category.color,
            categoryId: mark.category.id,
          };
        }),
      );

      return result;
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
    const distances = await this.markRep.query(
      this.customSqlQueryService.getDistance(),
      [lat, lng, markId],
    );
    return distances[0]?.distance || 0;
  }
}
