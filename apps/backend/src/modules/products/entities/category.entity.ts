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
import { Store } from '@modules/stores/entities/store.entity';
 
@Entity('categories')
@Index(['storeId', 'name'])
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;
 
  @Column()
  storeId: string;
 
  @ManyToOne(() => Store, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'storeId' })
  store: Store;
 
  @Column({ length: 100 })
  name: string;
 
  @Column({ length: 255, nullable: true })
  description: string;
 
  @Column({ length: 7, nullable: true })
  color: string; // hex: "#FF5733" para UI
 
  @Column({ default: true })
  isActive: boolean;
 
  @Column({ default: 0 })
  sortOrder: number;
 
  @CreateDateColumn()
  createdAt: Date;
 
  @UpdateDateColumn()
  updatedAt: Date;
}
