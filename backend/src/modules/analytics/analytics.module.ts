import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Estimate } from '../../database/entities/estimate.entity';
import { Project } from '../../database/entities/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Estimate, Project])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}

