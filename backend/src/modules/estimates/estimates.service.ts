import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Estimate, EstimateStatus } from '../../database/entities/estimate.entity';
import { EstimateItem } from '../../database/entities/estimate-item.entity';
import { Project } from '../../database/entities/project.entity';
import { Unit } from '../../database/entities/unit.entity';
import { BillingService } from '../billing/billing.service';
import { CreateEstimateDto } from './dto/create-estimate.dto';
import { UpdateEstimateDto } from './dto/update-estimate.dto';

@Injectable()
export class EstimatesService {
  constructor(
    @InjectRepository(Estimate)
    private estimatesRepository: Repository<Estimate>,
    @InjectRepository(EstimateItem)
    private estimateItemsRepository: Repository<EstimateItem>,
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(Unit)
    private unitsRepository: Repository<Unit>,
    private billingService: BillingService,
  ) {}

  async findAll(userId: string): Promise<Estimate[]> {
    return this.estimatesRepository.find({
      where: { project: { user: { id: userId } } },
      relations: ['project', 'items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByProject(projectId: string, userId: string): Promise<Estimate[]> {
    return this.estimatesRepository.find({
      where: { project: { id: projectId, user: { id: userId } } },
      relations: ['items'],
      order: { version: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Estimate> {
    const estimate = await this.estimatesRepository.findOne({
      where: { id, project: { user: { id: userId } } },
      relations: ['project', 'items', 'items.unit', 'items.area', 'project.user'],
    });

    if (!estimate) {
      throw new NotFoundException('Estimate not found');
    }

    return estimate;
  }

  async findByPublicToken(token: string): Promise<Estimate> {
    const estimate = await this.estimatesRepository.findOne({
      where: { publicToken: token },
      relations: ['project', 'project.client', 'items', 'items.unit'],
    });

    if (!estimate) {
      throw new NotFoundException('Estimate not found');
    }

    return estimate;
  }

  async create(
    createEstimateDto: CreateEstimateDto,
    userId: string,
  ): Promise<Estimate> {
    // Check usage limits for free plan
    const canCreate = await this.billingService.checkUsageLimit(userId);

    if (!canCreate) {
      throw new ForbiddenException(
        'You have reached your estimate limit. Please upgrade to Pro.',
      );
    }

    const project = await this.projectsRepository.findOne({
      where: { id: createEstimateDto.projectId, user: { id: userId } },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Calculate version
    const lastEstimate = await this.estimatesRepository.findOne({
      where: { project: { id: project.id } },
      order: { version: 'DESC' },
    });

    const version = lastEstimate ? lastEstimate.version + 1 : 1;

    // Validate that all unitIds exist if items are provided
    if (createEstimateDto.items && createEstimateDto.items.length > 0) {
      const unitIds = createEstimateDto.items.map(item => item.unitId);
      const uniqueUnitIds = [...new Set(unitIds)];
      const existingUnits = await this.unitsRepository.find({
        where: { id: In(uniqueUnitIds) },
      });
      
      if (existingUnits.length !== uniqueUnitIds.length) {
        const existingUnitIds = new Set(existingUnits.map(u => u.id));
        const missingUnitIds = uniqueUnitIds.filter(id => !existingUnitIds.has(id));
        throw new BadRequestException(
          `Invalid unit IDs: ${missingUnitIds.join(', ')}. Please ensure all units exist.`
        );
      }
    }

    const estimate = this.estimatesRepository.create({
      project,
      version,
      ...createEstimateDto,
    });

    // Calculate totals before saving
    this.calculateTotals(estimate);

    const savedEstimate = await this.estimatesRepository.save(estimate);

    // Increment usage count only once after successful creation
    await this.billingService.incrementUsage(userId);

    return savedEstimate;
  }

  async update(
    id: string,
    updateEstimateDto: UpdateEstimateDto,
    userId: string,
  ): Promise<Estimate> {
    const estimate = await this.findOne(id, userId);

    Object.assign(estimate, updateEstimateDto);

    // Recalculate totals if items changed
    if (updateEstimateDto.items) {
      this.calculateTotals(estimate);
    }

    return this.estimatesRepository.save(estimate);
  }

  async updateStatus(
    id: string,
    status: EstimateStatus,
    userId: string,
  ): Promise<Estimate> {
    const estimate = await this.findOne(id, userId);

    estimate.status = status;

    if (status === EstimateStatus.SENT && !estimate.sentAt) {
      estimate.sentAt = new Date();
    }

    if (status === EstimateStatus.APPROVED && !estimate.approvedAt) {
      estimate.approvedAt = new Date();
    }

    return this.estimatesRepository.save(estimate);
  }

  async remove(id: string, userId: string): Promise<void> {
    const estimate = await this.findOne(id, userId);
    await this.estimatesRepository.remove(estimate);
  }

  private calculateTotals(estimate: Estimate) {
    let subtotal = 0;
    let taxTotal = 0;

    estimate.items.forEach((item) => {
      subtotal += Number(item.subtotal);
      taxTotal += Number(item.tax);
    });

    estimate.subtotal = subtotal;
    estimate.taxTotal = taxTotal;
    estimate.total = subtotal + taxTotal;
  }
}

