import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Material } from './material.entity';

@Entity('units')
export class Unit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  abbreviation: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 1 })
  conversionFactor: number;

  @OneToMany(() => Material, (material) => material.unit)
  materials: Material[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

