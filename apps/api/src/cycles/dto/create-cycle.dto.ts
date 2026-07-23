import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MinLength } from 'class-validator';

const MIN_FIELD_LENGTH = 1;

export class CreateCycleDto {
  @ApiProperty()
  @IsString()
  @MinLength(MIN_FIELD_LENGTH)
  name!: string;

  @ApiProperty()
  @IsString()
  @MinLength(MIN_FIELD_LENGTH)
  code!: string;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  endsAt?: string;
}
