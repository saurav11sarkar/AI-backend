import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum UserRole {
  admin = 'admin',
  user = 'user',
}

export class CreateAuthDto {
  @ApiPropertyOptional({
    example: 'sauravsarkar.developer@gmail.com',
  })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({
    example: 'Saurav Sarkar',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: '123456',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiPropertyOptional({
    enum: UserRole,
    example: UserRole.user,
    default: UserRole.user,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
