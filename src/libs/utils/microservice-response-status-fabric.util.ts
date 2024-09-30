import { HttpStatus } from '@nestjs/common';
import { MicroserviceResponseStatus } from '../../marks/dto/microservice-response-status.dto';

export class MicroserviceResponseStatusFabric {
  static create(
    status: HttpStatus,
    message?: string,
  ): MicroserviceResponseStatus {
    return {
      status,
      message,
    };
  }
}
