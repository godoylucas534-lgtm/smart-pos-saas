import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('store_counters')
export class StoreCounter {
  @PrimaryColumn('uuid')
  storeId: string;

  @PrimaryColumn({ length: 100 })
  counterName: string;

  @Column({ type: 'bigint', default: 0 })
  currentValue: number;

  @UpdateDateColumn()
  updatedAt: Date;
}

