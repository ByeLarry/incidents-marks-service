import { Injectable } from '@nestjs/common';
import { CoordsDto } from './dto/coords.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Mark } from './entities/mark.entity';
import { Category } from './entities/category.entity';
import { DataSource, MoreThanOrEqual, Repository } from 'typeorm';
import {
  checkApproximateDistance,
  getDistance,
  getNearestPoints,
} from 'src/utils/get-nearest-points';
import { VerifyMarkDto } from './dto/verify-mark.dto';
import { Verification } from './entities/verification.entity';
import { MarkDto } from './dto/mark.dto';
import { CategoryDto } from './dto/categories.dto';
import { MarkRecvDto } from './dto/mark-recv.dto';
import { CreateMarkDto } from './dto/create-mark.dto';

@Injectable()
export class MarksService {
  constructor(
    @InjectRepository(Mark) private readonly markRep: Repository<Mark>,
    @InjectRepository(Category)
    private readonly categoryRep: Repository<Category>,
    @InjectRepository(Verification)
    private readonly verificationRep: Repository<Verification>,
    private readonly dataSource: DataSource,
  ) {}

  test(data: string) {
    console.log(data);
    return `[From marks]: ${data}`;
  }

  async getMarks(data: CoordsDto): Promise<MarkRecvDto[] | string> {
    try {
      const marks = await this.markRep.query(getNearestPoints, [
        data.lng,
        data.lat,
      ]);
      return marks;
    } catch (e) {
      return '500';
    }
  }

  async getMark(data: MarkDto): Promise<MarkRecvDto | string> {
    try {
      const mark = await this.markRep.findOne({
        where: { id: Number(data.markId) },
        relations: ['category'],
      });
      if (!mark) return '404';

      const verified = await this.verificationRep.count({
        where: { mark: { id: Number(data.markId) } },
      });

      const distance: Array<{ distance: number }> = await this.markRep.query(
        getDistance,
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
    } catch (e) {
      return '500';
    }
  }

  async verifyTrue(
    data: VerifyMarkDto,
  ): Promise<{ verified: number } | string> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const mark = await queryRunner.manager.findOne(Mark, {
        where: { id: data.markId },
      });

      if (!mark) {
        await queryRunner.rollbackTransaction();
        return '404';
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
    } catch (e) {
      return '500';
    } finally {
      await queryRunner.release();
    }
  }

  async verifyFalse(
    data: VerifyMarkDto,
  ): Promise<{ verified: number } | string> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const mark = await queryRunner.manager.findOne(Mark, {
        where: { id: data.markId },
      });

      if (!mark) {
        queryRunner.rollbackTransaction();
        return '404';
      }

      await queryRunner.manager.delete(Verification, {
        mark: { id: data.markId },
      });

      const verified = await queryRunner.manager.count(Verification, {
        where: { mark: { id: Number(data.markId) } },
      });

      await queryRunner.commitTransaction();
      return { verified };
    } catch (e) {
      return '500';
    } finally {
      await queryRunner.release();
    }
  }

  async getCategories(): Promise<CategoryDto[] | string> {
    try {
      const categories: CategoryDto[] = await this.categoryRep.find({
        select: ['id', 'name', 'color'],
      });

      if (!categories) return '404';
      return categories;
    } catch (e) {
      return '500';
    }
  }

  async createMark(data: CreateMarkDto): Promise<MarkRecvDto | string> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const category = await queryRunner.manager.findOne(Category, {
        where: { id: data.categoryId },
      });

      if (!category) {
        await queryRunner.rollbackTransaction();
        return '404';
      }

      const checkMark = await queryRunner.manager.query(
        checkApproximateDistance,
        [data.lng, data.lat, 25],
      );

      if (checkMark.length > 0) {
        await queryRunner.rollbackTransaction();
        return '409';
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
        return '403';
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
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return '500';
    } finally {
      await queryRunner.release();
    }
  }
}
