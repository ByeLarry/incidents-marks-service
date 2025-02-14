import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
  TypeOrmHealthIndicator,
  HealthCheckResult,
} from '@nestjs/terminus';
import { Response } from 'express';
import { HealthStatusEnum } from '../libs/enums';

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
  async check() {
    const host = this.configService.get<string>('HOST');
    const port = this.configService.get<string>('PORT');

    const healthResult: HealthCheckResult = await this.healthService.check([
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

    const mapStatus = (status: string) => {
      switch (status) {
        case 'ok':
        case 'up':
          return HealthStatusEnum.HEALTHY;
        case 'error':
        case 'shutting_down':
          return HealthStatusEnum.UNHEALTHY;
        default:
          return HealthStatusEnum.DEGRADED;
      }
    };

    return {
      status: mapStatus(healthResult.status),
      entries: Object.entries(healthResult.details).reduce(
        (acc, [key, value]: any) => {
          acc[key] = {
            data: {},
            status: mapStatus(value.status),
            tags: ['marks'],
          };
          return acc;
        },
        {},
      ),
    };
  }

  @Get('emptyEndpoint')
  emptyEndpoint(@Res() res: Response) {
    return res.status(HttpStatus.OK).send();
  }
}
