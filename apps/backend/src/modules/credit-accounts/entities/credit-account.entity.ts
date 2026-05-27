import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('credit_accounts')
@Index(['storeId', 'customerId'], { unique: true })
export class CreditAccount {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  storeId!: string;

  @Column()
  customerId!: string;

  @Column({ type: 'bigint', default: 0 })
  balance!: number;

  @Column({ nullable: true })
  lastPaymentAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
