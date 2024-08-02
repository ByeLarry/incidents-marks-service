import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AppLoggerService } from 'src/utils/logger';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new AppLoggerService();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const calledHandler = context.getHandler().name;
    this.logger.log(`Handler(method) called: ${calledHandler}`);

    return next.handle();
  }
}
