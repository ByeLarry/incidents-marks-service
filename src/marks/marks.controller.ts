import { MarksService } from './marks.service';
import { MsgMarksEnum } from '../libs/enums/message-marks.enum';
import { CoordsDto } from './dto/coords.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';
import { VerifyMarkDto } from './dto/verify-mark.dto';
import { MarkDto } from './dto/mark.dto';
import { CreateMarkDto } from './dto/create-mark.dto';

@Controller()
export class MarksController {
  constructor(private readonly marksService: MarksService) {}

  @MessagePattern(MsgMarksEnum.MAP_INIT)
  getMarks(@Payload() data: CoordsDto) {
    return this.marksService.getMarks(data);
  }

  @MessagePattern(MsgMarksEnum.MARK_GET)
  getMark(@Payload() data: MarkDto) {
    return this.marksService.getMark(data);
  }

  @MessagePattern(MsgMarksEnum.MARK_VERIFY_TRUE)
  verifyTrue(@Payload() data: VerifyMarkDto) {
    return this.marksService.verifyTrue(data);
  }

  @MessagePattern(MsgMarksEnum.MARK_VERIFY_FALSE)
  verifyFalse(@Payload() data: VerifyMarkDto) {
    return this.marksService.verifyFalse(data);
  }

  @MessagePattern(MsgMarksEnum.CREATE_MARK)
  createMark(data: CreateMarkDto) {
    return this.marksService.createMark(data);
  }

  @MessagePattern(MsgMarksEnum.GET_ALL_MARKS)
  getAllMarks() {
    return this.marksService.getAllMarks();
  }

  @MessagePattern(MsgMarksEnum.DELETE_MARK)
  deleteMark(@Payload() id: number) {
    return this.marksService.deleteMarkById(id);
  }
}
