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
import { Project } from './project.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.clients)
  user: User;

  @Column()
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  company: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true })
  taxId: string; // RFC, NIT, etc.

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => Project, (project) => project.client)
  projects: Project[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

