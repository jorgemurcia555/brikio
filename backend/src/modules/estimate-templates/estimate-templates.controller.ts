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
import { EstimateTemplatesService } from './estimate-templates.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateEstimateTemplateDto } from './dto/create-estimate-template.dto';
import { UpdateEstimateTemplateDto } from './dto/update-estimate-template.dto';
import { UserRole } from '../../database/entities/user.entity';

@Controller('estimate-templates')
@UseGuards(JwtAuthGuard)
export class EstimateTemplatesController {
  constructor(
    private readonly templatesService: EstimateTemplatesService,
  ) {}

  @Get()
  async findAll(@CurrentUser('id') userId: string) {
    return this.templatesService.findAll(userId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.templatesService.findOne(id, userId);
  }

  @Post()
  async create(
    @Body() createDto: CreateEstimateTemplateDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.templatesService.create(createDto, userId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateEstimateTemplateDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.templatesService.update(id, updateDto, userId);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.templatesService.remove(id, userId);
    return { message: 'Template deleted successfully' };
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAllForAdmin() {
    return this.templatesService.findAllForAdmin();
  }
}

