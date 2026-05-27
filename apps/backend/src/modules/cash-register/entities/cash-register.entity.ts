import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn,
} from 'typeorm';

export enum CashRegisterStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

@Entity('cash_registers')
export class CashRegister {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  storeId!: string;

  @Column()
  cashierId!: string;

  @Column({ type: 'enum', enum: CashRegisterStatus, default: CashRegisterStatus.OPEN })
  status!: CashRegisterStatus;

  @Column({ type: 'bigint', default: 0 })
  openingAmount!: number;

  @Column({ type: 'bigint', nullable: true })
  closingAmount?: number;

  @Column({ type: 'bigint', nullable: true })
  expectedAmount?: number;

  @Column({ type: 'bigint', nullable: true })
  difference?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ nullable: true })
  closedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne('User', { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'cashierId' })
  cashier?: any;
}
