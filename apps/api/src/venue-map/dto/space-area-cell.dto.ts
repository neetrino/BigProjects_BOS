import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

const MIN_COORDINATE = 0;

export class SpaceAreaCellDto {
  @ApiProperty()
  @IsInt()
  @Min(MIN_COORDINATE)
  x!: number;

  @ApiProperty()
  @IsInt()
  @Min(MIN_COORDINATE)
  y!: number;
}
