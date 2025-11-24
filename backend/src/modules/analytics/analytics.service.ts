import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estimate, EstimateStatus } from '../../database/entities/estimate.entity';
import { Project } from '../../database/entities/project.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Estimate)
    private estimatesRepository: Repository<Estimate>,
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async getDashboardMetrics(userId: string) {
    const [totalProjects, totalEstimates, approvedEstimates] =
      await Promise.all([
        this.projectsRepository.count({
          where: { user: { id: userId } },
        }),
        this.estimatesRepository.count({
          where: { project: { user: { id: userId } } },
        }),
        this.estimatesRepository.count({
          where: {
            project: { user: { id: userId } },
            status: EstimateStatus.APPROVED,
          },
        }),
      ]);

    const approvalRate =
      totalEstimates > 0 ? (approvedEstimates / totalEstimates) * 100 : 0;

    // Get total value of approved estimates
    const approvedEstimatesData = await this.estimatesRepository.find({
      where: {
        project: { user: { id: userId } },
        status: EstimateStatus.APPROVED,
      },
      select: ['total'],
    });

    const totalRevenue = approvedEstimatesData.reduce(
      (sum, est) => sum + Number(est.total),
      0,
    );

    return {
      totalProjects,
      totalEstimates,
      approvedEstimates,
      approvalRate: approvalRate.toFixed(2),
      totalRevenue,
    };
  }
}

