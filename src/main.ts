import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { LoggingInterceptor } from './libs/interceptors/logger.interceptor';
import { MARKS_RMQ_QUEUE } from './libs/utils/consts.util';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const httpApp = await NestFactory.create(AppModule);
  const configService = httpApp.get(ConfigService);
  const port = configService.get<number>('PORT');

  await httpApp.listen(port);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [`${process.env.RMQ_HOST}`],
        queue: MARKS_RMQ_QUEUE,
        queueOptions: {
          durable: false,
        },
      },
    },
  );
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new LoggingInterceptor());
  await app.listen();
}
bootstrap();
