import { HttpStatus, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { SearchDto } from '../../libs/dto';
import { MsgSearchEnum } from '../../libs/enums';
import { handleAsyncOperation } from '../../libs/helpers';
import { MicroserviceResponseStatusFabric } from '../../libs/utils';
import { MicroserviceResponseStatus, MarksSearchDto } from '../dto';
import { Mark } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { SearchService } from '../../libs/services';

@Injectable()
export class MarksSearchService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Mark) private readonly markRep: Repository<Mark>,
    private readonly searchService: SearchService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.reindexSearchEngine();
  }

  async searchMarks(
    data: SearchDto,
  ): Promise<Mark[] | MicroserviceResponseStatus> {
    return handleAsyncOperation(async () => {
      const result = await this.searchService.search<
        SearchDto,
        MarksSearchDto[]
      >(data, MsgSearchEnum.SEARCH_MARKS);
      if (!result)
        return MicroserviceResponseStatusFabric.create(HttpStatus.NOT_FOUND);

      return this.markRep.find({
        select: ['id', 'title', 'category', 'lat', 'lng'],
        where: { id: In(result.map((el) => el.id)) },
      });
    });
  }

  async reindexSearchEngine(): Promise<MicroserviceResponseStatus> {
    return handleAsyncOperation(async () => {
      const marks = await this.markRep
        .createQueryBuilder('mark')
        .select([
          'mark.id',
          'mark.lat',
          'mark.lng',
          'mark.addressDescription',
          'mark.addressName',
        ])
        .getMany();

      if (marks.length === 0)
        return MicroserviceResponseStatusFabric.create(HttpStatus.NOT_FOUND);

      this.searchService.update(marks, MsgSearchEnum.SET_MARKS);
      return MicroserviceResponseStatusFabric.create(HttpStatus.NO_CONTENT);
    });
  }
}
