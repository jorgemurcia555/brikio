import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estimate, EstimateStatus } from '../../database/entities/estimate.entity';
import { EstimateItem } from '../../database/entities/estimate-item.entity';
import { Project } from '../../database/entities/project.entity';
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
      relations: ['project', 'items', 'items.unit', 'items.area'],
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

    // Increment usage count after successful creation
    await this.billingService.incrementUsage(userId);

    const estimate = this.estimatesRepository.create({
      project,
      version,
      ...createEstimateDto,
    });

    const savedEstimate = await this.estimatesRepository.save(estimate);

    // Increment usage count
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

