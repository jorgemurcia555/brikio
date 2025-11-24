import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Material } from '../../database/entities/material.entity';
import { MaterialCategory } from '../../database/entities/material-category.entity';
import { Unit } from '../../database/entities/unit.entity';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';

@Injectable()
export class MaterialsService {
  constructor(
    @InjectRepository(Material)
    private materialsRepository: Repository<Material>,
    @InjectRepository(MaterialCategory)
    private categoriesRepository: Repository<MaterialCategory>,
    @InjectRepository(Unit)
    private unitsRepository: Repository<Unit>,
  ) {}

  async findAll(userId?: string, search?: string) {
    const query = this.materialsRepository
      .createQueryBuilder('material')
      .leftJoinAndSelect('material.category', 'category')
      .leftJoinAndSelect('material.unit', 'unit')
      .where('material.isActive = :isActive', { isActive: true })
      .andWhere('(material.user IS NULL OR material.user = :userId)', {
        userId,
      });

    if (search) {
      query.andWhere('material.name ILIKE :search', { search: `%${search}%` });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Material> {
    const material = await this.materialsRepository.findOne({
      where: { id },
      relations: ['category', 'unit', 'user'],
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    return material;
  }

  async create(
    createMaterialDto: CreateMaterialDto,
    userId?: string,
  ): Promise<Material> {
    const material = this.materialsRepository.create({
      ...createMaterialDto,
      user: userId ? ({ id: userId } as any) : undefined,
    });

    return this.materialsRepository.save(material);
  }

  async update(
    id: string,
    updateMaterialDto: UpdateMaterialDto,
  ): Promise<Material> {
    const material = await this.findOne(id);

    Object.assign(material, updateMaterialDto);

    return this.materialsRepository.save(material);
  }

  async remove(id: string): Promise<void> {
    const material = await this.findOne(id);
    material.isActive = false;
    await this.materialsRepository.save(material);
  }

  async getCategories(): Promise<MaterialCategory[]> {
    return this.categoriesRepository.find({
      relations: ['parent'],
      order: { sortOrder: 'ASC' },
    });
  }

  async getUnits(): Promise<Unit[]> {
    return this.unitsRepository.find();
  }
}

