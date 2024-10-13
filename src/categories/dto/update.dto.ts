import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  color?: string;
}
