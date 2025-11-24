import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialsController } from './materials.controller';
import { MaterialsService } from './materials.service';
import { Material } from '../../database/entities/material.entity';
import { MaterialCategory } from '../../database/entities/material-category.entity';
import { Unit } from '../../database/entities/unit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Material, MaterialCategory, Unit])],
  controllers: [MaterialsController],
  providers: [MaterialsService],
  exports: [MaterialsService],
})
export class MaterialsModule {}

