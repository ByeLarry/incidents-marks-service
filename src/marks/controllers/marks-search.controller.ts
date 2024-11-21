import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SearchDto } from '../../libs/dto';
import { MsgMarksEnum } from '../../libs/enums';
import { MarksSearchService } from '../services';

@Controller()
export class MarksSearchController {
  constructor(private readonly marksSearchService: MarksSearchService) {}

  @MessagePattern(MsgMarksEnum.SEARCH_MARKS)
  searchCategories(@Payload() dto: SearchDto) {
    return this.marksSearchService.searchMarks(dto);
  }

  @MessagePattern(MsgMarksEnum.REINDEX)
  async reindexSearhchEngine() {
    return this.marksSearchService.reindexSearchEngine();
  }
}
