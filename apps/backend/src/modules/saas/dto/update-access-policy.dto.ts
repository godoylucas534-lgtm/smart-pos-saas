import { IsDateString, IsOptional, IsString, Length } from 'class-validator';

export class UpdateAccessPolicyDto {
  @IsOptional()
  @IsDateString()
  accessBlockedUntil?: string;

  @IsOptional()
  @IsDateString()
  autoReactivateAt?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  customSuspendMessage?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  supportContact?: string;
}