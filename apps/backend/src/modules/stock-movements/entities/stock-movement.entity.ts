import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum StockMovementType {
  SALE = 'sale',
  PURCHASE = 'purchase',
  ADJUSTMENT = 'adjustment',
  CANCELLATION = 'cancellation',
}

@Entity('stock_movements')
@Index(['storeId', 'productId', 'createdAt'])
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  productId!: string;

  @Column()
  storeId!: string;

  @Column({ type: 'enum', enum: StockMovementType })
  type!: StockMovementType;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  quantity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  previousStock!: number;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  newStock!: number;

  @Column({ length: 150, nullable: true })
  reference?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
