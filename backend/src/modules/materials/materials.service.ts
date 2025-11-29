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
      .leftJoinAndSelect('material.user', 'user')
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
    const materialData: any = {
      name: createMaterialDto.name,
      description: createMaterialDto.description,
      sku: createMaterialDto.sku,
      basePrice: createMaterialDto.basePrice,
      taxRate: createMaterialDto.taxRate,
      performanceFactor: createMaterialDto.performanceFactor,
      supplier: createMaterialDto.supplier,
      supplierUrl: createMaterialDto.supplierUrl,
      user: userId ? ({ id: userId } as any) : undefined,
    };

    // Only add category and unit if provided
    if (createMaterialDto.categoryId) {
      materialData.category = { id: createMaterialDto.categoryId } as any;
    }
    if (createMaterialDto.unitId) {
      materialData.unit = { id: createMaterialDto.unitId } as any;
    }

    const material = this.materialsRepository.create(materialData);

    const savedMaterial = await this.materialsRepository.save(material);
    
    // Reload with relations to ensure all data is present
    // save() returns Material | Material[], but we're passing a single entity so it returns Material
    const materialId = Array.isArray(savedMaterial) 
      ? (savedMaterial as Material[])[0].id 
      : (savedMaterial as Material).id;
    return this.findOne(materialId);
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

