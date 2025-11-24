import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { TemplateItem } from './template-item.entity';
import { Material } from './material.entity';

@Entity('template_item_materials')
export class TemplateItemMaterial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => TemplateItem, (template) => template.materials)
  templateItem: TemplateItem;

  @ManyToOne(() => Material, (material) => material.templateMaterials, {
    eager: true,
  })
  material: Material;

  @Column()
  quantityFormula: string; // Ej: "(area * 1.05) / performanceFactor"

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  laborHours: number;

  @Column({ nullable: true })
  laborHoursFormula: string; // Ej: "area * 0.5"

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}

