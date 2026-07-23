import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { SpaceAreaCellDto } from './space-area-cell.dto';

const MIN_NAME_LENGTH = 1;

export class CreateSpaceAreaDto {
  @ApiProperty()
  @IsString()
  @MinLength(MIN_NAME_LENGTH)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ type: [SpaceAreaCellDto], description: 'Non-empty set of grid cells.' })
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SpaceAreaCellDto)
  cells!: SpaceAreaCellDto[];
}
