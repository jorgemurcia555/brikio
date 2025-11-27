import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstimateTemplate } from '../../database/entities/estimate-template.entity';
import { CreateEstimateTemplateDto } from './dto/create-estimate-template.dto';
import { UpdateEstimateTemplateDto } from './dto/update-estimate-template.dto';

@Injectable()
export class EstimateTemplatesService {
  constructor(
    @InjectRepository(EstimateTemplate)
    private templatesRepository: Repository<EstimateTemplate>,
  ) {}

  async findAll(userId: string): Promise<EstimateTemplate[]> {
    return this.templatesRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<EstimateTemplate> {
    const template = await this.templatesRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  async create(
    createDto: CreateEstimateTemplateDto,
    userId: string,
  ): Promise<EstimateTemplate> {
    const template = this.templatesRepository.create({
      ...createDto,
      user: { id: userId } as any,
    });

    return this.templatesRepository.save(template);
  }

  async update(
    id: string,
    updateDto: UpdateEstimateTemplateDto,
    userId: string,
  ): Promise<EstimateTemplate> {
    const template = await this.findOne(id, userId);

    Object.assign(template, updateDto);

    return this.templatesRepository.save(template);
  }

  async remove(id: string, userId: string): Promise<void> {
    const template = await this.findOne(id, userId);
    await this.templatesRepository.remove(template);
  }

  async incrementUsage(id: string, userId: string): Promise<void> {
    const template = await this.findOne(id, userId);
    template.usageCount += 1;
    await this.templatesRepository.save(template);
  }

  async findAllForAdmin(): Promise<EstimateTemplate[]> {
    return this.templatesRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }
}

