import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../../core/guards/roles.guard';

export class CreateUserDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  firstName!: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  lastName!: string;

  @IsEmail()
  @Transform(({ value }) => value?.trim()?.toLowerCase())
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsEnum(UserRole)
  role!: UserRole;
}
