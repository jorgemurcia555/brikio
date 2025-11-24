import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { TemplateItem } from '../../database/entities/template-item.entity';
import { TemplateItemMaterial } from '../../database/entities/template-item-material.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TemplateItem, TemplateItemMaterial])],
  controllers: [TemplatesController],
  providers: [TemplatesService],
  exports: [TemplatesService],
})
export class TemplatesModule {}

