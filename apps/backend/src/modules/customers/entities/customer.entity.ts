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

@Entity('customers')
@Index(['storeId', 'document'], { unique: true, where: '"document" IS NOT NULL' })
@Index(['storeId', 'phone'])
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  storeId!: string;

  @ManyToOne(() => Store, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'storeId' })
  store!: Store;

  @Column({ length: 100 })
  firstName!: string;

  @Column({ length: 100, nullable: true })
  lastName!: string;

  @Column({ length: 150, nullable: true })
  email!: string;

  @Column({ length: 20, nullable: true })
  phone!: string;

  @Column({ length: 20, nullable: true })
  alternativePhone!: string;

  @Column({ length: 30, nullable: true, default: 'CI' })
  documentType!: string;

  @Column({ length: 20, nullable: true })
  document!: string;

  @Column({ type: 'date', nullable: true })
  birthDate!: Date;

  @Column({ length: 255, nullable: true })
  address!: string;

  @Column({ length: 120, nullable: true })
  city!: string;

  @Column({ length: 200, nullable: true })
  businessName!: string;

  @Column({ length: 30, nullable: true })
  taxDocument!: string;

  @Column({ type: 'bigint', default: 0 })
  creditLimit!: number;

  @Column({ type: 'bigint', default: 0 })
  totalPurchases!: number;

  @Column({ default: 0 })
  totalOrders!: number;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  get fullName(): string {
    return [this.firstName, this.lastName].filter(Boolean).join(' ');
  }
}
