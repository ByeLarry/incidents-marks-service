import { HttpStatusExtends } from '../../libs/enums/extends-http-status.enum';

export interface MicroserviceResponseStatus {
  status: HttpStatusExtends;
  message?: string;
}
