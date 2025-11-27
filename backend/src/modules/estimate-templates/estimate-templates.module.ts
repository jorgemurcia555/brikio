import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstimateTemplatesController } from './estimate-templates.controller';
import { EstimateTemplatesService } from './estimate-templates.service';
import { EstimateTemplate } from '../../database/entities/estimate-template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EstimateTemplate])],
  controllers: [EstimateTemplatesController],
  providers: [EstimateTemplatesService],
  exports: [EstimateTemplatesService],
})
export class EstimateTemplatesModule {}

