import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CountCategoriesIncidentsDto {
  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  incidentsCount: number;
}
