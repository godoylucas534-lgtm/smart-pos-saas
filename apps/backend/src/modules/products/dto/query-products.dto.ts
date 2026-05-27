import { IsOptional, IsString, IsUUID, IsBoolean, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
 
export class QueryProductsDto {
  @IsOptional()
  @IsString()
  search?: string;
 
  @IsOptional()
  @IsUUID()
  categoryId?: string;
 
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;
 
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  lowStock?: boolean;
 
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number;
 
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number;
}
