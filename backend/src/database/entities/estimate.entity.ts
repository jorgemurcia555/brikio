import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  BeforeInsert,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Project } from './project.entity';
import { EstimateItem } from './estimate-item.entity';

export enum EstimateStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

@Entity('estimates')
export class Estimate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Project, (project) => project.estimates, { eager: true })
  project: Project;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({
    type: 'enum',
    enum: EstimateStatus,
    default: EstimateStatus.DRAFT,
  })
  status: EstimateStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  taxTotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  profitMarginPercent: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  laborCost: number;

  @Column({ nullable: true })
  publicToken: string; // UUID para compartir presupuesto

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  aiSuggestions: {
    // Solo para usuarios Pro
    coherenceAnalysis?: any;
    costOptimizations?: any;
    alternativeMaterials?: any;
    generatedDescription?: string;
  };

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => EstimateItem, (item) => item.estimate, { cascade: true })
  items: EstimateItem[];

  @BeforeInsert()
  generatePublicToken() {
    if (!this.publicToken) {
      this.publicToken = uuidv4();
    }
  }

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

