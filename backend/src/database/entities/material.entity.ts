import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { MaterialCategory } from './material-category.entity';
import { Unit } from './unit.entity';
import { User } from './user.entity';
import { TemplateItemMaterial } from './template-item-material.entity';

@Entity('materials')
export class Material {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  sku: string;

  @ManyToOne(() => MaterialCategory, (category) => category.materials, {
    eager: true,
  })
  category: MaterialCategory;

  @ManyToOne(() => Unit, (unit) => unit.materials, { eager: true })
  unit: Unit;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  basePrice: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 1 })
  performanceFactor: number; // Rendimiento (ej: 1 saco rinde 7 m2)

  @Column({ nullable: true })
  supplier: string;

  @Column({ nullable: true })
  supplierUrl: string;

  @ManyToOne(() => User, (user) => user.customMaterials, { nullable: true })
  user: User; // null = material global, not null = material custom del usuario

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 1 })
  version: number;

  @OneToMany(
    () => TemplateItemMaterial,
    (templateMaterial) => templateMaterial.material,
  )
  templateMaterials: TemplateItemMaterial[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

