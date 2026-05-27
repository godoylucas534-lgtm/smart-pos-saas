import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum SaleStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  TRANSFER = 'transfer',
  CREDIT = 'credit',
  MIXED = 'mixed',
}

@Entity('sales')
@Index(['storeId', 'createdAt'])
@Index(['storeId', 'status'])
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @Column()
  storeId!: string;
  @Column({ nullable: true })
  customerId?: string;
  @Column()
  cashierId!: string;
  @Column({ length: 20 })
  receiptNumber!: string;
  @Column({ type: 'enum', enum: SaleStatus, default: SaleStatus.PENDING })
  status!: SaleStatus;
  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.CASH })
  paymentMethod!: PaymentMethod;
  @Column({ type: 'bigint', default: 0 })
  subtotal!: number;
  @Column({ type: 'bigint', default: 0 })
  taxAmount!: number;
  @Column({ type: 'bigint', default: 0 })
  discountAmount!: number;
  @Column({ type: 'bigint' })
  total!: number;
  @Column({ type: 'bigint', default: 0 })
  amountPaid!: number;
  @Column({ type: 'bigint', default: 0 })
  changeAmount!: number;
  @Column({ type: 'text', nullable: true })
  notes?: string;
  @Column({ type: 'jsonb', nullable: true })
  paymentDetails?: Record<string, any>;
  @OneToMany(() => SaleItem, (item) => item.sale, { cascade: true, eager: true })
  items!: SaleItem[];
  @ManyToOne('User', { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'cashierId' })
  cashier?: any;
  @ManyToOne('Customer', { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'customerId' })
  customer?: any;
  @CreateDateColumn()
  createdAt!: Date;
  @UpdateDateColumn()
  updatedAt!: Date;
}

@Entity('sale_items')
export class SaleItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @Column()
  saleId!: string;
  @ManyToOne(() => Sale, (sale) => sale.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'saleId' })
  sale!: Sale;
  @Column()
  productId!: string;
  @Column({ length: 200 })
  productName!: string;
  @Column({ length: 100, nullable: true })
  productSku?: string;
  @Column({ type: 'decimal', precision: 10, scale: 3 })
  quantity!: number;
  @Column({ type: 'bigint' })
  unitPrice!: number;
  @Column({ type: 'float', default: 0 })
  taxRate!: number;
  @Column({ type: 'bigint', default: 0 })
  discountAmount!: number;
  @Column({ type: 'bigint' })
  lineTotal!: number;
}
