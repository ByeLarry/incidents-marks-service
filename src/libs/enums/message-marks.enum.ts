import { MsgSearchEnum } from './message-search.enum';

export enum MsgMarksEnum {
  MAP_INIT = 'mark.nearest',
  MARK_GET = 'mark.one',
  MARK_VERIFY_TRUE = 'mark.verify',
  MARK_VERIFY_FALSE = 'mark.unverify',
  GET_VERIFY = 'verify.one',
  CREATE_MARK = 'mark.create',
  GET_ALL_MARKS = 'mark.all',
  DELETE_MARK = 'mark.delete',
  SEARCH_MARKS = MsgSearchEnum.SEARCH_MARKS,
  REINDEX = 'mark.reindex'
}
