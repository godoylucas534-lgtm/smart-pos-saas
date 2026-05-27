import { Transform } from 'class-transformer';
import { IsEmail, IsObject, IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdateStoreDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  name?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  address?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  phone?: string;

  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => value?.trim()?.toLowerCase())
  email?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  taxId?: string;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  @Matches(/^[A-Z]{3}$/)
  @Transform(({ value }) => value?.trim()?.toUpperCase())
  currency?: string;

  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}
