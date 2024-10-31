import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The name of the user',
    type: String,
  })
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'User description',
    type: String,
  })
  description: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The role of the user',
    type: String,
  })
  role: string;

  @IsString()
  @IsOptional()
  @IsUUID()
  @ApiProperty({
    description: 'The userid that the user reports to',
    type: String,
  })
  reportTo?: string;

  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  children?: CreateUserDto[];
}
