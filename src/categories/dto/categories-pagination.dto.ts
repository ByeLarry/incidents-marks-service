import { IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { CategoriesSortEnum } from '../../libs/enums';

export class CategoriesPaginationDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  @IsPositive()
  readonly page: number;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  @IsPositive()
  readonly limit: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => CategoriesSortEnum[value], { toClassOnly: true })
  readonly sort?: CategoriesSortEnum;
}
