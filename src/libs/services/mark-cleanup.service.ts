import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import * as cron from 'node-cron';
import { Mark } from '../../marks/entities/mark.entity';
import { DateEnum } from '../enums/date.enum';
import { AppLoggerService } from '../helpers';

@Injectable()
export class MarkCleanupService {
  constructor(
    @InjectRepository(Mark)
    private readonly markRepository: Repository<Mark>,
    private readonly logger: AppLoggerService,
  ) {
    cron.schedule('0 * * * *', this.cleanupOldMarks.bind(this));
  }
  async cleanupOldMarks() {
    const twelveHoursAgo = new Date(Date.now() - DateEnum.ONE_DAY);
    try {
      await this.markRepository.delete({ createdAt: LessThan(twelveHoursAgo) });
      this.logger.log('Old marks deleted');
    } catch (error) {
      this.logger.error('Error deleting old marks:', error);
    }
  }
}
