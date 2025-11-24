import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TemplateItem } from '../../database/entities/template-item.entity';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(TemplateItem)
    private templatesRepository: Repository<TemplateItem>,
  ) {}

  async findAll(userId?: string): Promise<TemplateItem[]> {
    return this.templatesRepository.find({
      where: [{ isPublic: true }, { user: { id: userId } }],
      relations: ['materials', 'materials.material'],
      order: { usageCount: 'DESC' },
    });
  }

  async findOne(id: string): Promise<TemplateItem> {
    const template = await this.templatesRepository.findOne({
      where: { id },
      relations: ['materials', 'materials.material', 'materials.material.unit'],
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  // Additional CRUD methods would go here...
}

