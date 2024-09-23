import { MarksService } from './marks.service';
import { MsgMarksEnum } from '../utils/msgMarks.enum';
import { CoordsDto } from './dto/coords.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';
import { VerifyMarkDto } from './dto/verifyMark.dto';
import { MarkDto } from './dto/mark.dto';
import { CreateMarkDto } from './dto/createMark.dto';

@Controller()
export class MarksController {
  constructor(private readonly marksService: MarksService) {}

  @MessagePattern(MsgMarksEnum.MAP_INIT_SEND)
  getMarks(@Payload() data: CoordsDto) {
    return this.marksService.getMarks(data);
  }

  @MessagePattern(MsgMarksEnum.MARK_GET_SEND)
  getMark(@Payload() data: MarkDto) {
    return this.marksService.getMark(data);
  }

  @MessagePattern(MsgMarksEnum.MARK_VERIFY_TRUE_SEND)
  verifyTrue(@Payload() data: VerifyMarkDto) {
    return this.marksService.verifyTrue(data);
  }

  @MessagePattern(MsgMarksEnum.MARK_VERIFY_FALSE_SEND)
  verifyFalse(@Payload() data: VerifyMarkDto) {
    return this.marksService.verifyFalse(data);
  }

  @MessagePattern(MsgMarksEnum.CATEGORIES_SEND)
  getCategories() {
    return this.marksService.getCategories();
  }

  @MessagePattern(MsgMarksEnum.CREATE_MARK_SEND)
  createMark(data: CreateMarkDto) {
    return this.marksService.createMark(data);
  }
}
