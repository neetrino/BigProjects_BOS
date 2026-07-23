import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

const MIN_LOGIN_PASSWORD_LENGTH = 1;

export class LoginDto {
  @ApiProperty({ example: 'admin@bigprojects.local' })
  @IsEmail()
  email!: string;

  @ApiProperty({ writeOnly: true })
  @IsString()
  @MinLength(MIN_LOGIN_PASSWORD_LENGTH)
  password!: string;
}
