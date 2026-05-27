import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('audit_logs')
@Index(['storeId', 'createdAt'])
@Index(['storeId', 'action'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  storeId?: string;

  @Column({ nullable: true })
  userId?: string;

  @Column({ length: 150 })
  action!: string;

  @Column({ length: 100, nullable: true })
  entity?: string;

  @Column({ length: 150, nullable: true })
  entityId?: string;

  @Column({ type: 'text', nullable: true })
  oldValue?: string;

  @Column({ type: 'text', nullable: true })
  newValue?: string;

  @Column({ length: 50, nullable: true })
  ip?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
