import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

/** Response shape for `POST /auth/login` and `GET /auth/me`. */
export class CurrentUserResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ enum: UserRole })
  role!: UserRole;

  @ApiProperty()
  locale!: string;
}
