import { Injectable } from '@nestjs/common';
import { Socket } from 'net';
import { MsgMarksEnum } from 'src/utils/msg.marks.enum';
import { CoordsDto } from './dto/coords.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Mark } from './entities/mark.entity';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { getNearestPoints } from 'src/utils/get-nearest-points';

@Injectable()
export class MarksService {
  constructor(
    @InjectRepository(Mark) private readonly markRep: Repository<Mark>,
    @InjectRepository(Category)
    private readonly categoryRep: Repository<Category>,
  ) {}

  test(socket: Socket, data: string) {
    console.log(data);
    return socket.emit(MsgMarksEnum.TEST_RECV, `[From marks]: ${data}`);
  }

  async mapInit(socket: Socket, data: CoordsDto) {
    try {
      const marks = await this.markRep.query(getNearestPoints, [
        data.lng,
        data.lat,
      ]);
      return socket.emit(MsgMarksEnum.MAP_INIT_RECV, marks);
    } catch (e) {
      console.log(e);
    }
  }

  async markGet(socket: Socket, data: number) {
    try {
      const mark = await this.markRep.findOne({ where: { id: data } });
      return socket.emit(MsgMarksEnum.MARK_GET_RECV, mark);
    } catch (e) {
      console.log(e);
    }
  }
}
