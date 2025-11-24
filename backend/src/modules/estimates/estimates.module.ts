import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstimatesController } from './estimates.controller';
import { EstimatesService } from './estimates.service';
import { Estimate } from '../../database/entities/estimate.entity';
import { EstimateItem } from '../../database/entities/estimate-item.entity';
import { Project } from '../../database/entities/project.entity';
import { BillingModule } from '../billing/billing.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Estimate, EstimateItem, Project]),
    BillingModule,
  ],
  controllers: [EstimatesController],
  providers: [EstimatesService],
  exports: [EstimatesService],
})
export class EstimatesModule {}

