import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

@Entity('estimate_templates')
export class EstimateTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.customTemplates, { nullable: false })
  user: User;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb' })
  templateData: {
    sections: any[];
    header: any;
    jobSummary: any;
    projectInfo: any;
    paymentMethod: any;
    contactInfo: any;
    signature: any;
    theme?: string;
  };

  @Column({ default: false })
  isDefault: boolean;

  @Column({ type: 'int', default: 0 })
  usageCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

