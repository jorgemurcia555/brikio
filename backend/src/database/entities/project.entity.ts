import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Client } from './client.entity';
import { Area } from './area.entity';
import { Estimate } from './estimate.entity';

export enum ProjectStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.projects)
  user: User;

  @ManyToOne(() => Client, (client) => client.projects, { nullable: true })
  client: Client;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  projectType: string; // Casa, Edificio, Remodelación, etc.

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalArea: number;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.DRAFT,
  })
  status: ProjectStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    floors?: number;
    constructionType?: string;
    targetBudget?: number;
    startDate?: string;
    endDate?: string;
    [key: string]: any;
  };

  @OneToMany(() => Area, (area) => area.project, { cascade: true })
  areas: Area[];

  @OneToMany(() => Estimate, (estimate) => estimate.project)
  estimates: Estimate[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

