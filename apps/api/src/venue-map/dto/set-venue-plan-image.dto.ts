import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsPositive, IsString, MinLength } from 'class-validator';

const MIN_OBJECT_KEY_LENGTH = 1;

export class SetVenuePlanImageDto {
  @ApiProperty()
  @IsString()
  @MinLength(MIN_OBJECT_KEY_LENGTH)
  objectKey!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  width!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  height!: number;
}
