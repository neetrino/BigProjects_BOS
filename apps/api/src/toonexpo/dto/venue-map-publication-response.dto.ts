import { ApiProperty } from '@nestjs/swagger';
import { VenueMapPublicationStatus } from '@prisma/client';

export class VenueMapPublicationResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() venuePlanId!: string;
  @ApiProperty() snapshotVersion!: number;
  @ApiProperty() checksum!: string;
  @ApiProperty({ enum: VenueMapPublicationStatus }) status!: VenueMapPublicationStatus;
  @ApiProperty({ nullable: true }) toonexpoSnapshotId!: string | null;
  @ApiProperty({ nullable: true }) errorMessage!: string | null;
  @ApiProperty({ nullable: true }) publishedAt!: Date | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}
