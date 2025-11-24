import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { Project } from '../../database/entities/project.entity';
import { Area } from '../../database/entities/area.entity';
import { Client } from '../../database/entities/client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Area, Client])],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}

