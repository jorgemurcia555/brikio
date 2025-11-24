import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Subscription } from './subscription.entity';

export enum PlanName {
  TRIAL = 'trial',
  BASIC = 'basic',
  PREMIUM = 'premium',
}

@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: PlanName,
    unique: true,
  })
  name: PlanName;

  @Column()
  displayName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ default: 'month' })
  billingInterval: string; // month, year

  @Column({ type: 'jsonb' })
  features: {
    maxEstimates: number | null; // null = unlimited
    aiEnabled: boolean;
    csvImport: boolean;
    advancedReports: boolean;
    customTemplates: boolean;
    prioritySupport: boolean;
    [key: string]: any;
  };

  @Column({ nullable: true })
  stripeProductId: string;

  @Column({ nullable: true })
  stripePriceId: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Subscription, (subscription) => subscription.plan)
  subscriptions: Subscription[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

