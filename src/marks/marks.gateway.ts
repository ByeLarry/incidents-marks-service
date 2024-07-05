import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { MarksService } from './marks.service';
import { Socket } from 'net';
import { MsgMarksEnum } from 'src/utils/msg.marks.enum';
import { CoordsDto } from './dto/coords.dto';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:4000',
  },
})
export class MarksGateway {
  constructor(private readonly marksService: MarksService) {}

  @SubscribeMessage(MsgMarksEnum.TEST_SEND)
  test(@MessageBody() data: string, @ConnectedSocket() socket: Socket) {
    return this.marksService.test(socket, data);
  }

  @SubscribeMessage(MsgMarksEnum.MAP_INIT_SEND)
  mapInit(@MessageBody() data: CoordsDto, @ConnectedSocket() socket: Socket) {
    return this.marksService.mapInit(socket, data);
  }

  @SubscribeMessage(MsgMarksEnum.MARK_GET_SEND)
  markGet(@MessageBody() data: string, @ConnectedSocket() socket: Socket) {
    return this.marksService.markGet(socket, Number(data));
  }
}
