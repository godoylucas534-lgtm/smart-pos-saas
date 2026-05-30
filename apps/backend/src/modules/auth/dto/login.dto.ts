import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsIn, Matches } from 'class-validator';

export class LoginDto {
  @Transform(({ value }) => String(value || '').trim().toLowerCase())
  @IsEmail({}, { message: 'Email inválido' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/\d/, { message: 'La contraseña debe contener al menos 1 número' })
  password!: string;
}

export class RegisterStoreDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName!: string;

  @Transform(({ value }) => String(value || '').trim().toLowerCase())
  @IsEmail({}, { message: 'Email inválido' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/\d/, { message: 'La contraseña debe contener al menos 1 número' })
  password!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(100)
  storeName!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(100)
  storeSlug!: string;

  @IsOptional()
  @IsIn(['PYG', 'USD', 'ARS', 'BRL', 'CLP', 'COP', 'MXN', 'PEN', 'UYU'])
  currency?: string;
}
