import { MsgSearchEnum } from './message-search.enum';

export enum MsgCategoriesEnum {
  CATEGORIES_STATS = 'category.stats',
  CATEGORIES = 'category.all',
  CREATE_CATEGORY = 'category.create',
  UPDATE_CATEGORY = 'category.update',
  DELETE_CATEGORY = 'category.delete',
  GET_CATEGORY = 'category.one',
  SEARCH_CATEGORIES = MsgSearchEnum.SEARCH_CATEGORIES,
}
