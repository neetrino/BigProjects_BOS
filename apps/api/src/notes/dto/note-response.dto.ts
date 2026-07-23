import { ApiProperty } from '@nestjs/swagger';

export class NoteAuthorResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;
}

export class NoteResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  body!: string;

  @ApiProperty({ type: NoteAuthorResponseDto })
  author!: NoteAuthorResponseDto;

  @ApiProperty()
  createdAt!: Date;
}
