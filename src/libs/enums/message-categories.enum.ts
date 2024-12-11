import { MsgSearchEnum } from './message-search.enum';

export enum MsgCategoriesEnum {
  CATEGORIES_STATS = 'category.stats',
  CATEGORIES = 'category.all',
  CATEGORIES_PAGINATION = 'category.pagination',
  CREATE_CATEGORY = 'category.create',
  UPDATE_CATEGORY = 'category.update',
  DELETE_CATEGORY = 'category.delete',
  GET_CATEGORY = 'category.one',
  SEARCH_CATEGORIES = MsgSearchEnum.SEARCH_CATEGORIES,
  REINDEX = 'category.reindex',
}
