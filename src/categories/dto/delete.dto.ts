import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class DeleteCategoryDto {
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  id: number;
}
