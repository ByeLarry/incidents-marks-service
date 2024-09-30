import { HttpStatus } from '@nestjs/common';

export interface MicroserviceResponseStatus {
  status: HttpStatus;
  message?: string;
}
