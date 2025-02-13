import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { Response } from 'express';

@Controller('health')
export class HealthController {
  constructor(
    private readonly healthService: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly typeOrm: TypeOrmHealthIndicator,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    const host = this.configService.get<string>('HOST');
    const port = this.configService.get<string>('PORT');
    return this.healthService.check([
      () =>
        this.http.pingCheck(
          'self',
          `http://${host}:${port}/health/emptyEndpoint`,
        ), // Проверка связи
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024), // RSS-память < 150MB
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024), // Heap-память < 150MB
      () => this.typeOrm.pingCheck('database'), // Проверка соединения с SQL БД (TypeORM)
      () =>
        this.disk.checkStorage('disk', { path: '/', thresholdPercent: 0.9 }), // Проверка диска (свободно > 10%)
    ]);
  }

  @Get('emptyEndpoint')
  emptyEndpoint(@Res() res: Response) {
    return res.status(HttpStatus.OK).send();
  }
}
