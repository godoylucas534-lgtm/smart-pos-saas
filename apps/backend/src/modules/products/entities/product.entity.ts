import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Store } from '../../stores/entities/store.entity';
import { Category } from './category.entity';

@Entity('products')
@Index(['storeId', 'sku'], { unique: true })
@Index(['storeId', 'barcode'])
@Index(['storeId', 'isActive'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  storeId!: string;

  @ManyToOne(() => Store, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'storeId' })
  store!: Store;

  @Column({ nullable: true })
  categoryId!: string;

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category!: Category;

  @Column({ length: 200 })
  name!: string;

  @Column({ length: 500, nullable: true })
  description!: string;

  @Column({ length: 100, nullable: true })
  sku!: string;

  @Column({ length: 100, nullable: true })
  barcode!: string;

  @Column({ length: 120, nullable: true })
  brand!: string;

  @Column({ length: 120, nullable: true })
  supplier!: string;

  @Column({ type: 'bigint', default: 0 })
  costPrice!: number;

  @Column({ type: 'bigint' })
  salePrice!: number;

  @Column({ type: 'float', default: 0 })
  taxRate!: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  stock!: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  stockMin!: number;

  @Column({ length: 20, default: 'unidad' })
  unit!: string;

  @Column({ default: false })
  isBulk!: boolean;

  @Column({ default: true })
  trackStock!: boolean;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ length: 500, nullable: true })
  imageUrl!: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
