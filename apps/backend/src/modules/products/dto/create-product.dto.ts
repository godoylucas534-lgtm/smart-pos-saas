import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsUUID,
  IsIn,
  Min,
  MaxLength,
  IsUrl,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

const optionalTrimmedString = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

export class CreateProductDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @Transform(optionalTrimmedString)
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @Transform(optionalTrimmedString)
  @IsString()
  @MaxLength(120)
  brand?: string;

  @IsOptional()
  @Transform(optionalTrimmedString)
  @IsString()
  @MaxLength(120)
  supplier?: string;

  @IsOptional()
  @Transform(optionalTrimmedString)
  @IsString()
  @MaxLength(100)
  sku?: string;

  @IsOptional()
  @Transform(optionalTrimmedString)
  @IsString()
  @MaxLength(100)
  barcode?: string;

  @IsOptional()
  @Transform(optionalTrimmedString)
  @IsUUID()
  categoryId?: string;

  @IsNumber({}, { message: 'costPrice debe ser numerico' })
  @Min(0, { message: 'costPrice debe ser mayor o igual a 0' })
  @Type(() => Number)
  costPrice!: number;

  @IsNumber({}, { message: 'salePrice debe ser numerico' })
  @Min(1, { message: 'salePrice debe ser mayor a 0' })
  @Type(() => Number)
  salePrice!: number;

  @IsOptional()
  @IsNumber({}, { message: 'taxRate debe ser numerico' })
  @IsIn([0, 5, 10], { message: 'taxRate debe ser 0, 5 o 10' })
  @Min(0, { message: 'taxRate debe ser mayor o igual a 0' })
  @Type(() => Number)
  taxRate?: number;

  @IsOptional()
  @IsNumber({}, { message: 'stock debe ser numerico' })
  @Min(0, { message: 'stock debe ser mayor o igual a 0' })
  @Type(() => Number)
  stock?: number;

  @IsOptional()
  @IsNumber({}, { message: 'stockMin debe ser numerico' })
  @Min(0, { message: 'stockMin debe ser mayor o igual a 0' })
  @Type(() => Number)
  stockMin?: number;

  @IsOptional()
  @Transform(optionalTrimmedString)
  @IsString()
  @IsIn(['unidad', 'kg', 'gramo', 'litro', 'metro', 'caja', 'par', 'docena'], {
    message: 'unit debe ser una unidad valida',
  })
  unit?: string;

  @IsOptional()
  @IsBoolean()
  isBulk?: boolean;

  @IsOptional()
  @IsBoolean()
  trackStock?: boolean;

  @IsOptional()
  @Transform(optionalTrimmedString)
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
