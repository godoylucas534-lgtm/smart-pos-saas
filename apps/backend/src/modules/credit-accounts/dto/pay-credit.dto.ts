import { IsNumber, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PayCreditDto {
  @IsUUID('4', { message: 'customerId debe ser un UUID válido' })
  customerId!: string;

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  amount!: number;
}

