import { Transform, Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { CountCategoriesIncidentsDto } from '.';

export class CategoriesStatsDto {
  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  total: number;

  @IsNotEmpty()
  @Type(() => CountCategoriesIncidentsDto)
  incidents: CountCategoriesIncidentsDto[];
}
