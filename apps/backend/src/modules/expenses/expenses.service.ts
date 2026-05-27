import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(@InjectRepository(Expense) private readonly repo: Repository<Expense>) {}

  create(storeId: string, dto: CreateExpenseDto) {
    return this.repo.save(this.repo.create({ ...dto, storeId }));
  }

  findAll(storeId: string, dateFrom?: string, dateTo?: string) {
    const where: any = { storeId };
    if (dateFrom && dateTo) {
      where.date = Between(dateFrom, dateTo);
    }
    return this.repo.find({ where, order: { date: 'DESC' } });
  }

  async update(storeId: string, id: string, dto: UpdateExpenseDto) {
    const expense = await this.repo.findOne({ where: { id, storeId } });
    if (!expense) throw new NotFoundException('Gasto no encontrado.');
    Object.assign(expense, dto);
    return this.repo.save(expense);
  }

  async remove(storeId: string, id: string) {
    const expense = await this.repo.findOne({ where: { id, storeId } });
    if (!expense) throw new NotFoundException('Gasto no encontrado.');
    await this.repo.remove(expense);
    return { ok: true };
  }
}
