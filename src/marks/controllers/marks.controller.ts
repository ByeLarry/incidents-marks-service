import { MsgMarksEnum } from '../../libs/enums/message-marks.enum';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';
import { VerifyMarkDto } from '../dto/verify-mark.dto';
import { MarkDto } from '../dto/mark.dto';
import { CreateMarkDto } from '../dto/create-mark.dto';
import { MarksService } from '../services';
import { DeleteMarkByUserDto } from '../dto';

@Controller()
export class MarksController {
  constructor(private readonly marksService: MarksService) {}

  @MessagePattern(MsgMarksEnum.MAP_INIT)
  getMarks() {
    return this.marksService.getAllMarks();
  }

  @MessagePattern(MsgMarksEnum.MARK_GET)
  getMark(@Payload() data: MarkDto) {
    return this.marksService.getMark(data);
  }

  @MessagePattern(MsgMarksEnum.MARK_VERIFY_TRUE)
  verifyTrue(@Payload() data: VerifyMarkDto) {
    return this.marksService.verifyMark(data, true);
  }

  @MessagePattern(MsgMarksEnum.MARK_VERIFY_FALSE)
  verifyFalse(@Payload() data: VerifyMarkDto) {
    return this.marksService.verifyMark(data, false);
  }

  @MessagePattern(MsgMarksEnum.CREATE_MARK)
  createMark(data: CreateMarkDto) {
    return this.marksService.createMark(data);
  }

  @MessagePattern(MsgMarksEnum.GET_ALL_MARKS)
  getAllMarks() {
    return this.marksService.getAllMarks();
  }

  @MessagePattern(MsgMarksEnum.DELETE_MARK_BY_ADMIN)
  deleteMarkByAdmin(@Payload() id: number) {
    return this.marksService.deleteMarkById(id);
  }

  @MessagePattern(MsgMarksEnum.DELETE_MARK_BY_USER)
  deleteMarkByUser(@Payload() data: DeleteMarkByUserDto) {
    return this.marksService.deleteMarkByIdAndUserId(data);
  }
}
