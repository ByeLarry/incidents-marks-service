import { IsNotEmpty, IsString } from 'class-validator';

export class AddressDto {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  name: string;
}
