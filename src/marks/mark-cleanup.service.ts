import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Mark } from './entities/mark.entity';
import * as cron from 'node-cron';

@Injectable()
export class MarkCleanupService {
  constructor(
    @InjectRepository(Mark)
    private readonly markRepository: Repository<Mark>,
  ) {
    cron.schedule('0 * * * *', this.cleanupOldMarks.bind(this));
  }
  async cleanupOldMarks() {
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    try {
      await this.markRepository.delete({ createdAt: LessThan(twelveHoursAgo) });
      console.log(Date.now(), ' Старые записи успешно удалены');
    } catch (error) {
      console.error(Date.now(), ' Ошибка при удалении старых записей:', error);
    }
  }
}
