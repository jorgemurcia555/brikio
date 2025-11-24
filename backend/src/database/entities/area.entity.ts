import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Project } from './project.entity';
import { EstimateItem } from './estimate-item.entity';

@Entity('areas')
export class Area {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Project, (project) => project.areas)
  project: Project;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  areaM2: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  perimeterMl: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  heightM: number;

  @Column({ type: 'int', default: 1 })
  floorLevel: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => EstimateItem, (item) => item.area)
  estimateItems: EstimateItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

