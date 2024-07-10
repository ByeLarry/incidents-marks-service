import { Injectable } from '@nestjs/common';
import { CoordsDto } from './dto/coords.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Mark } from './entities/mark.entity';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { getNearestPoints } from 'src/utils/get-nearest-points';
import { VerifyMarkDto } from './dto/verify-mark.dto';
import { Verification } from './entities/verification.entity';
import { MarkDto } from './dto/mark.dto';

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

  async marksGet(data: CoordsDto) {
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

  async markGet(data: MarkDto) {
    try {
      const mark = await this.markRep.findOne({
        where: { id: Number(data.markId) },
        relations: ['category'],
      });
      if (!mark) return '404';

      const verified = await this.verificationRep.count({
        where: { mark: { id: Number(data.markId) } },
      });

      const userVerification = await this.verificationRep.findOne({
        where: {
          mark: { id: Number(data.markId) },
          userId: data.userId,
        },
      });
      return { ...mark, verified, isMyVerify: !!userVerification };
    } catch (e) {
      console.log(e);
      return '500';
    }
  }

  async verifyTrue(data: VerifyMarkDto) {
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
      console.log(e);
      return '500';
    }
  }

  async verifyFalse(data: VerifyMarkDto) {
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
      console.log(e);
      return '500';
    }
  }
}
