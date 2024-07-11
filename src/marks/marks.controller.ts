import { MessageBody } from '@nestjs/websockets';
import { MarksService } from './marks.service';
import { MsgMarksEnum } from 'src/utils/msg.marks.enum';
import { CoordsDto } from './dto/coords.dto';
import { MessagePattern } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';
import { VerifyMarkDto } from './dto/verify-mark.dto';
import { MarkDto } from './dto/mark.dto';
import { CreateMarkDto } from './dto/create-mark.dto';

@Controller()
export class MarksController {
  constructor(private readonly marksService: MarksService) {}

  @MessagePattern({ cmd: MsgMarksEnum.TEST_SEND })
  test(@MessageBody() data: string) {
    return this.marksService.test(data);
  }

  @MessagePattern({ cmd: MsgMarksEnum.MAP_INIT_SEND })
  marksGet(@MessageBody() data: CoordsDto) {
    return this.marksService.marksGet(data);
  }

  @MessagePattern({ cmd: MsgMarksEnum.MARK_GET_SEND })
  markGet(@MessageBody() data: MarkDto) {
    return this.marksService.markGet(data);
  }

  @MessagePattern({ cmd: MsgMarksEnum.MARK_VERIFY_TRUE_SEND })
  verifyTrue(@MessageBody() data: VerifyMarkDto) {
    return this.marksService.verifyTrue(data);
  }

  @MessagePattern({ cmd: MsgMarksEnum.MARK_VERIFY_FALSE_SEND })
  verifyFalse(@MessageBody() data: VerifyMarkDto) {
    return this.marksService.verifyFalse(data);
  }

  @MessagePattern({ cmd: MsgMarksEnum.CATEGORIES_SEND })
  getCategories() {
    return this.marksService.getCategories();
  }

  @MessagePattern({ cmd: MsgMarksEnum.CREATE_MARK_SEND })
  createMark(data: CreateMarkDto) {
    return this.marksService.createMark(data);
  }
}
