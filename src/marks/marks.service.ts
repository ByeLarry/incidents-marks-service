import {
  HttpStatus,
  Inject,
  Injectable,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { CoordsDto } from './dto/coords.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Mark } from './entities/mark.entity';
import { DataSource, MoreThanOrEqual, Repository } from 'typeorm';
import { VerifyMarkDto } from './dto/verify-mark.dto';
import { Verification } from './entities/verification.entity';
import { MarkDto } from './dto/mark.dto';
import { MarkRecvDto } from './dto/mark-recv.dto';
import { CreateMarkDto } from './dto/create-mark.dto';
import { MicroserviceResponseStatus } from './dto/microservice-response-status.dto';
import { MicroserviceResponseStatusFabric } from '../libs/utils/microservice-response-status-fabric.util';
import { CustomSqlQueryService } from '../libs/services/custom-sql-query.service';
import { ConfigService } from '@nestjs/config';
import { Category } from '../categories/entities';
import { ClientProxy } from '@nestjs/microservices';
import { SEARCH_SERVICE_TAG } from '../libs/utils';
import { MsgSearchEnum } from '../libs/enums';
import { firstValueFrom } from 'rxjs';
import { AppLoggerService } from '../libs/helpers';

type AsyncFunction<T> = () => Promise<T>;

@Injectable()
export class MarksService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Mark) private readonly markRep: Repository<Mark>,
    @InjectRepository(Verification)
    private readonly verificationRep: Repository<Verification>,
    private readonly dataSource: DataSource,
    private readonly customSqlQueryService: CustomSqlQueryService,
    private readonly configService: ConfigService,
    @Inject(SEARCH_SERVICE_TAG) private searchClient: ClientProxy,
    private readonly logger: AppLoggerService,
  ) {}

  private async handleAsyncOperation<T>(
    operation: AsyncFunction<T>,
  ): Promise<T | MicroserviceResponseStatus> {
    try {
      return await operation();
    } catch (error) {
      console.error(error);
      const res = MicroserviceResponseStatusFabric.create(
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
      return res;
    }
  }

  async onApplicationBootstrap() {
    return await this.handleAsyncOperation(async () => {
      const marks = await this.markRep
        .createQueryBuilder('mark')
        .select([
          'mark.id',
          'mark.lat',
          'mark.lng',
          'mark.addressDescription',
          'mark.addressName',
          'mark.title',
          'mark.description',
          'mark.createdAt',
          'mark.updatedAt',
        ])
        .getMany();

      const res = await firstValueFrom(
        this.searchClient.send<string>(MsgSearchEnum.SET_MARKS, marks),
      );

      this.logger.log(`[${MsgSearchEnum.SET_MARKS}] - ${res}`);
    });
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

  async createMark(
    data: CreateMarkDto,
  ): Promise<MarkRecvDto | MicroserviceResponseStatus> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const result = await this.handleAsyncOperation(async () => {
      const [category, checkMark] = await Promise.all([
        queryRunner.manager.findOne(Category, {
          where: { id: data.categoryId },
        }),
        queryRunner.manager.query(
          this.customSqlQueryService.checkApproximateDistance(
            this.configService.get('DB_SCHEMA') || 'public',
          ),
          [data.lng, data.lat, 25],
        ),
      ]);

      if (!category) {
        await queryRunner.rollbackTransaction();
        return MicroserviceResponseStatusFabric.create(HttpStatus.NOT_FOUND);
      }

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
      mark.addressName = data.address.name;
      mark.addressDescription = data.address.description;
      await queryRunner.manager.save(mark);
      await queryRunner.commitTransaction();
      return this.createMarkRecvDto(mark);
    });
    await queryRunner.release();
    return result;
  }

  async getAllMarks() {
    return this.handleAsyncOperation(
      async () =>
        await this.markRep.query(
          this.customSqlQueryService.getAllPoints(
            this.configService.get('DB_SCHEMA') || 'public',
          ),
        ),
    );
  }

  async deleteMarkById(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const result = await this.handleAsyncOperation(async () => {
      const mark = await queryRunner.manager.findOne(Mark, { where: { id } });
      if (!mark) {
        await queryRunner.rollbackTransaction();
        return MicroserviceResponseStatusFabric.create(HttpStatus.NOT_FOUND);
      }
      await queryRunner.manager.delete(Mark, { id });
      await queryRunner.commitTransaction();
      return this.createMarkRecvDto(mark);
    });
    await queryRunner.release();
    return result;
  }
}
