import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Subscription } from './subscription.entity';
import { Project } from './project.entity';
import { Client } from './client.entity';
import { Material } from './material.entity';
import { TemplateItem } from './template-item.entity';

export enum UserRole {
  ADMIN = 'admin',
  CONSTRUCTOR = 'constructor',
  CLIENT = 'client',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CONSTRUCTOR,
  })
  role: UserRole;

  @Column({ nullable: true })
  companyName: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ default: false })
  onboardingCompleted: boolean;

  @Column({ type: 'jsonb', nullable: true })
  preferences: {
    currency?: string;
    taxRate?: number;
    defaultUnit?: string;
    language?: string;
  };

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'varchar', nullable: true })
  @Exclude()
  refreshToken: string | null;

  @OneToOne(() => Subscription, (subscription) => subscription.user, {
    eager: true,
  })
  subscription: Subscription;

  @OneToMany(() => Project, (project) => project.user)
  projects: Project[];

  @OneToMany(() => Client, (client) => client.user)
  clients: Client[];

  @OneToMany(() => Material, (material) => material.user)
  customMaterials: Material[];

  @OneToMany(() => TemplateItem, (template) => template.user)
  customTemplates: TemplateItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

