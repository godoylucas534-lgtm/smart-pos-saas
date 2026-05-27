import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class OpenCashRegisterDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  openingAmount!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
