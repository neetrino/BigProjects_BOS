import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';

const MIN_NAME_LENGTH = 1;
const MIN_PASSWORD_LENGTH = 8;

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @MinLength(MIN_NAME_LENGTH)
  name!: string;

  @ApiProperty({ example: 'staff@bigprojects.local' })
  @IsEmail()
  email!: string;

  @ApiProperty({ writeOnly: true, minLength: MIN_PASSWORD_LENGTH })
  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH)
  password!: string;

  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  role!: UserRole;
}
