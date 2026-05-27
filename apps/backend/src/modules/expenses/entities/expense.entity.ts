import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ExpenseCategory {
  RENT = 'alquiler',
  SERVICES = 'servicios',
  SUPPLIES = 'insumos',
  OTHER = 'otros',
}

@Entity('expenses')
@Index(['storeId', 'date'])
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  storeId!: string;

  @Column({ type: 'enum', enum: ExpenseCategory })
  category!: ExpenseCategory;

  @Column({ length: 200 })
  description!: string;

  @Column({ type: 'bigint' })
  amount!: number;

  @Column({ type: 'date' })
  date!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
