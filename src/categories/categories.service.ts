import { HttpStatus, Injectable } from '@nestjs/common';
import { CategoryDto, MicroserviceResponseStatus } from '../marks/dto';
import { MicroserviceResponseStatusFabric } from '../libs/utils';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities';

type AsyncFunction<T> = () => Promise<T>;

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRep: Repository<Category>,
  ) {}

  private async handleAsyncOperation<T>(
    operation: AsyncFunction<T>,
  ): Promise<T | MicroserviceResponseStatus> {
    try {
      return await operation();
    } catch (error) {
      console.error(error);
      const res = MicroserviceResponseStatusFabric.create(
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
      return res;
    }
  }

  async findAll() {
    return await this.handleAsyncOperation(async () => {
      const categories: CategoryDto[] = await this.categoryRep.find({
        select: ['id', 'name', 'color', 'createdAt', 'updatedAt'],
      });

      if (!categories)
        return MicroserviceResponseStatusFabric.create(HttpStatus.NOT_FOUND);
      return categories;
    });
  }
}
