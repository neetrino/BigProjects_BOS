import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

const MIN_NAME_LENGTH = 1;
const MIN_PASSWORD_LENGTH = 8;

/**
 * All fields are optional (partial update). An admin cannot use this to disable or demote
 * their own account — enforced in `UsersService.update`, not here, since it depends on the
 * requester's identity rather than the payload shape alone.
 */
export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(MIN_NAME_LENGTH)
  name?: string;

  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({ writeOnly: true, minLength: MIN_PASSWORD_LENGTH })
  @IsOptional()
  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH)
  password?: string;
}
