import { IsEnum, IsNumber, IsString, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ExpenseCategory } from '../entities/expense.entity';

export class CreateExpenseDto {
  @IsEnum(ExpenseCategory)
  category!: ExpenseCategory;

  @IsString()
  @MinLength(1)
  description!: string;

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  amount!: number;

  @IsString()
  @MinLength(10)
  date!: string;
}
