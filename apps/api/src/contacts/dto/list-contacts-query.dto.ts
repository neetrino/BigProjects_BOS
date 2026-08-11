import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ListContactsQueryDto {
  @ApiPropertyOptional({
    description: 'Case-insensitive match on contact name, email, phone, or organization name.',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
