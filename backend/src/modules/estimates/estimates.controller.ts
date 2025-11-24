import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { EstimatesService } from './estimates.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateEstimateDto } from './dto/create-estimate.dto';
import { UpdateEstimateDto } from './dto/update-estimate.dto';
import { EstimateStatus } from '../../database/entities/estimate.entity';

@Controller('estimates')
export class EstimatesController {
  constructor(private readonly estimatesService: EstimatesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@CurrentUser('id') userId: string) {
    return this.estimatesService.findAll(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('project/:projectId')
  async findByProject(
    @Param('projectId') projectId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.estimatesService.findByProject(projectId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.estimatesService.findOne(id, userId);
  }

  @Public()
  @Get('public/:token')
  async findByPublicToken(@Param('token') token: string) {
    return this.estimatesService.findByPublicToken(token);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createEstimateDto: CreateEstimateDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.estimatesService.create(createEstimateDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEstimateDto: UpdateEstimateDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.estimatesService.update(id, updateEstimateDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: EstimateStatus,
    @CurrentUser('id') userId: string,
  ) {
    return this.estimatesService.updateStatus(id, status, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.estimatesService.remove(id, userId);
  }
}

