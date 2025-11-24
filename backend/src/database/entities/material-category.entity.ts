import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Material } from './material.entity';

@Entity('material_categories')
export class MaterialCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ default: '#6B7280' })
  color: string;

  @ManyToOne(() => MaterialCategory, (category) => category.children, {
    nullable: true,
  })
  parent: MaterialCategory;

  @OneToMany(() => MaterialCategory, (category) => category.parent)
  children: MaterialCategory[];

  @OneToMany(() => Material, (material) => material.category)
  materials: Material[];

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

