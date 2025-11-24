import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../database/entities/project.entity';
import { Area } from '../../database/entities/area.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateAreaDto } from './dto/create-area.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(Area)
    private areasRepository: Repository<Area>,
  ) {}

  async findAll(userId: string): Promise<Project[]> {
    return this.projectsRepository.find({
      where: { user: { id: userId } },
      relations: ['client', 'areas'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['client', 'areas', 'estimates'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async create(
    createProjectDto: CreateProjectDto,
    userId: string,
  ): Promise<Project> {
    const project = this.projectsRepository.create({
      ...createProjectDto,
      user: { id: userId } as any,
      client: createProjectDto.clientId
        ? ({ id: createProjectDto.clientId } as any)
        : undefined,
    });

    return this.projectsRepository.save(project);
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    userId: string,
  ): Promise<Project> {
    const project = await this.findOne(id, userId);

    Object.assign(project, updateProjectDto);

    if (updateProjectDto.clientId) {
      project.client = { id: updateProjectDto.clientId } as any;
    }

    return this.projectsRepository.save(project);
  }

  async remove(id: string, userId: string): Promise<void> {
    const project = await this.findOne(id, userId);
    await this.projectsRepository.remove(project);
  }

  async addArea(
    projectId: string,
    createAreaDto: CreateAreaDto,
    userId: string,
  ): Promise<Area> {
    const project = await this.findOne(projectId, userId);

    const area = this.areasRepository.create({
      ...createAreaDto,
      project,
    });

    return this.areasRepository.save(area);
  }

  async updateArea(
    areaId: string,
    updateAreaDto: Partial<CreateAreaDto>,
  ): Promise<Area> {
    const area = await this.areasRepository.findOne({ where: { id: areaId } });

    if (!area) {
      throw new NotFoundException('Area not found');
    }

    Object.assign(area, updateAreaDto);

    return this.areasRepository.save(area);
  }

  async removeArea(areaId: string): Promise<void> {
    const area = await this.areasRepository.findOne({ where: { id: areaId } });

    if (!area) {
      throw new NotFoundException('Area not found');
    }

    await this.areasRepository.remove(area);
  }
}

