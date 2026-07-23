import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

const MIN_ID_LENGTH = 1;
const MIN_TITLE_LENGTH = 1;

export class CreateVenuePlanDto {
  @ApiProperty()
  @IsString()
  @MinLength(MIN_ID_LENGTH)
  eventCycleId!: string;

  @ApiProperty()
  @IsString()
  @MinLength(MIN_TITLE_LENGTH)
  title!: string;
}
