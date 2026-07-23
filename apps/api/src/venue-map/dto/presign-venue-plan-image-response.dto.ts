import { ApiProperty } from '@nestjs/swagger';

export class PresignVenuePlanImageResponseDto {
  @ApiProperty()
  objectKey!: string;

  @ApiProperty()
  uploadUrl!: string;
}
