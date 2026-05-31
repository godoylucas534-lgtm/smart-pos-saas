import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('store_access_policy')
@Index(['storeId'], { unique: true })
export class StoreAccessPolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  storeId: string;

  @Column({ type: 'timestamptz', nullable: true })
  accessBlockedUntil: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  autoReactivateAt: Date | null;

  @Column({ type: 'text', nullable: true })
  customSuspendMessage: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  supportContact: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
