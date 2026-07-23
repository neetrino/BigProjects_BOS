import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

const MIN_ID_LENGTH = 1;

export class GetVenuePlanQueryDto {
  @ApiProperty({ description: 'Event cycle id (required).' })
  @IsString()
  @MinLength(MIN_ID_LENGTH)
  cycleId!: string;
}
