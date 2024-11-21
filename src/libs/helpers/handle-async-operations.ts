import { HttpStatus } from '@nestjs/common';
import { MicroserviceResponseStatusFabric } from '../utils';
import { MicroserviceResponseStatus } from '../../marks/dto';

type AsyncFunction<T> = () => Promise<T>;

export async function handleAsyncOperation<T>(
  operation: AsyncFunction<T>,
): Promise<T | MicroserviceResponseStatus> {
  try {
    return await operation();
  } catch (error) {
    return MicroserviceResponseStatusFabric.create(
      HttpStatus.INTERNAL_SERVER_ERROR,
      error,
    );
  }
}
