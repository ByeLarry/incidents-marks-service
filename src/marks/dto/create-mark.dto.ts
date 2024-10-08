import { Transform, Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { AddressDto } from '.';

export class CreateMarkDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  lat: number;

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  lng: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  categoryId: number;

  @Type(() => AddressDto)
  address?: AddressDto;
}
