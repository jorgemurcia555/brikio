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
import { TemplateItemMaterial } from './template-item-material.entity';
import { EstimateItem } from './estimate-item.entity';

@Entity('template_items')
export class TemplateItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  category: string; // Cimentación, Estructura, Acabados, etc.

  @Column({ type: 'jsonb' })
  formula: {
    variables: Array<{
      name: string;
      label: string;
      type: 'number' | 'select';
      unit?: string;
      required: boolean;
      defaultValue?: any;
      options?: Array<{ label: string; value: any }>;
    }>;
    expressions?: Record<string, string>; // Para cálculos complejos
  };

  @Column({ default: false })
  isPublic: boolean; // true = template del sistema, false = custom del usuario

  @ManyToOne(() => User, (user) => user.customTemplates, { nullable: true })
  user: User;

  @OneToMany(
    () => TemplateItemMaterial,
    (templateMaterial) => templateMaterial.templateItem,
    { eager: true },
  )
  materials: TemplateItemMaterial[];

  @OneToMany(() => EstimateItem, (estimateItem) => estimateItem.templateItem)
  estimateItems: EstimateItem[];

  @Column({ type: 'int', default: 0 })
  usageCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

