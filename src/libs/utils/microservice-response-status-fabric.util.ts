import { MicroserviceResponseStatus } from '../../marks/dto/microservice-response-status.dto';
import { HttpStatusExtends } from '../enums/extends-http-status.enum';

export class MicroserviceResponseStatusFabric {
  static create(
    status: HttpStatusExtends,
    message?: string,
  ): MicroserviceResponseStatus {
    return {
      status,
      message,
    };
  }
}
