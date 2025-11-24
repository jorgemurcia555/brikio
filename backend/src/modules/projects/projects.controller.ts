import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateAreaDto } from './dto/create-area.dto';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async findAll(@CurrentUser('id') userId: string) {
    return this.projectsService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.projectsService.findOne(id, userId);
  }

  @Post()
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.create(createProjectDto, userId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.update(id, updateProjectDto, userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.projectsService.remove(id, userId);
  }

  @Post(':id/areas')
  async addArea(
    @Param('id') projectId: string,
    @Body() createAreaDto: CreateAreaDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.addArea(projectId, createAreaDto, userId);
  }

  @Put('areas/:areaId')
  async updateArea(
    @Param('areaId') areaId: string,
    @Body() updateAreaDto: Partial<CreateAreaDto>,
  ) {
    return this.projectsService.updateArea(areaId, updateAreaDto);
  }

  @Delete('areas/:areaId')
  async removeArea(@Param('areaId') areaId: string) {
    return this.projectsService.removeArea(areaId);
  }
}

