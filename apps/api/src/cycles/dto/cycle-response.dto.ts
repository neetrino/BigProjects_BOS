import { ApiProperty } from '@nestjs/swagger';
import { EventCycleStatus } from '@prisma/client';

export class CycleResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty({ enum: EventCycleStatus })
  status!: EventCycleStatus;

  @ApiProperty({ nullable: true, type: String, format: 'date-time' })
  startsAt!: Date | null;

  @ApiProperty({ nullable: true, type: String, format: 'date-time' })
  endsAt!: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
