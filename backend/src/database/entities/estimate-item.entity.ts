import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Estimate } from './estimate.entity';
import { Area } from './area.entity';
import { TemplateItem } from './template-item.entity';
import { Unit } from './unit.entity';

@Entity('estimate_items')
export class EstimateItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Estimate, (estimate) => estimate.items)
  estimate: Estimate;

  @ManyToOne(() => Area, (area) => area.estimateItems, { nullable: true })
  area: Area;

  @ManyToOne(() => TemplateItem, (template) => template.estimateItems, {
    nullable: true,
  })
  templateItem: TemplateItem;

  @Column()
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @ManyToOne(() => Unit, { eager: true })
  unit: Unit;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitCost: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  tax: number;

  @Column({ type: 'jsonb', nullable: true })
  breakdown: {
    // Detalle de materiales y mano de obra
    materials: Array<{
      materialId: string;
      materialName: string;
      quantity: number;
      unit: string;
      unitPrice: number;
      subtotal: number;
    }>;
    labor?: {
      hours: number;
      ratePerHour: number;
      subtotal: number;
    };
  };

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

