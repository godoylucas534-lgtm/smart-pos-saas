import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  Matches,
} from 'class-validator';

export class RegisterStoreDto {
  @IsString({ message: 'El nombre debe ser un texto' })
  @MinLength(2, { message: 'El nombre es muy corto' })
  @MaxLength(100)
  firstName!: string;

  @IsString({ message: 'El apellido debe ser un texto' })
  @MinLength(2, { message: 'El apellido es muy corto' })
  @MaxLength(100)
  lastName!: string;

  @IsEmail({}, { message: 'Email no válido' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/\d/, { message: 'La contraseña debe contener al menos un número' })
  password!: string;

  @IsString()
  @MinLength(3, { message: 'El nombre de la tienda es muy corto' })
  @MaxLength(100)
  storeName!: string;

  @IsString()
  @MinLength(3, { message: 'El slug es muy corto' })
  @MaxLength(100)
  storeSlug!: string;

  @IsOptional()
  @IsEnum(['PYG', 'USD', 'ARS', 'BRL'], { message: 'Moneda no soportada' })
  currency?: string;
}
