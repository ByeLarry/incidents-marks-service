import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class MarkRecvDto {
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  id: number;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  lat: number;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  lng: number;

  @IsString()
  title?: string;

  @IsString()
  description?: string;

  @IsDate()
  createdAt?: Date;

  @IsString()
  userId?: string;

  @IsNumber()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  distance?: number;

  @IsNumber()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  verified?: number;

  @IsBoolean()
  isMyVerify?: boolean;

  @IsNumber()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  categoryId?: number;

  @IsString()
  color?: string;

  @IsString()
  addressDescription?: string;

  @IsString()
  addressName?: string;
}
