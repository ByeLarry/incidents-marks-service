import { Injectable } from '@nestjs/common';
import { CoordsDto } from './dto/coords.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Mark } from './entities/mark.entity';
import { Category } from './entities/category.entity';
import { MoreThanOrEqual, Repository } from 'typeorm';
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
  ) {}

  test(data: string) {
    console.log(data);
    return `[From marks]: ${data}`;
  }

  async marksGet(data: CoordsDto): Promise<MarkRecvDto[] | string> {
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

  async markGet(data: MarkDto): Promise<MarkRecvDto | string> {
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
    try {
      const mark = await this.markRep.findOne({
        where: { id: data.markId },
      });

      if (!mark) return '404';

      const newVerification = new Verification();
      newVerification.mark = mark;
      newVerification.userId = data.userId;
      newVerification.createdAt = new Date();
      await this.verificationRep.save(newVerification);

      const verified = await this.verificationRep.count({
        where: { mark: { id: Number(data.markId) } },
      });

      return { verified };
    } catch (e) {
      return '500';
    }
  }

  async verifyFalse(
    data: VerifyMarkDto,
  ): Promise<{ verified: number } | string> {
    try {
      const mark = await this.markRep.findOne({
        where: { id: data.markId },
      });

      if (!mark) return '404';

      await this.verificationRep.delete({
        mark: { id: data.markId },
      });

      const verified = await this.verificationRep.count({
        where: { mark: { id: Number(data.markId) } },
      });

      return { verified };
    } catch (e) {
      return '500';
    }
  }

  async getCategories(): Promise<CategoryDto[] | string> {
    try {
      const categories: CategoryDto[] = await this.categoryRep.find({
        select: ['id', 'name'],
      });

      if (!categories) return '404';
      return categories;
    } catch (e) {
      return '500';
    }
  }

  async createMark(data: CreateMarkDto): Promise<MarkRecvDto | string> {
    try {
      const category = await this.categoryRep.findOne({
        where: { id: data.categoryId },
      });

      if (!category) return '404';

      const checkMark = await this.markRep.query(checkApproximateDistance, [
        data.lng,
        data.lat,
        50,
      ]);
      if (checkMark.length > 0) return '409';

      const twelveHoursAgo = new Date();
      twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

      const countLastTwelveHoursMarks = await this.markRep.count({
        where: {
          userId: data.userId,
          createdAt: MoreThanOrEqual(twelveHoursAgo),
        },
      });

      if (countLastTwelveHoursMarks >= 5) {
        return '403';
      }

      const mark = new Mark();
      mark.lat = data.lat;
      mark.lng = data.lng;
      mark.title = data.title;
      mark.description = data.description;
      mark.userId = data.userId;
      mark.category = category;

      await this.markRep.save(mark);

      const markRecv: MarkRecvDto = {
        id: mark.id,
        lat: mark.lat,
        lng: mark.lng,
        categoryId: mark.category.id,
      };
      return markRecv;
    } catch (e) {
      return '500';
    }
  }
}
