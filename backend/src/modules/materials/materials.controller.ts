import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';

@Controller('materials')
@UseGuards(JwtAuthGuard)
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Get()
  async findAll(
    @CurrentUser('id') userId: string,
    @Query('search') search?: string,
  ) {
    return this.materialsService.findAll(userId, search);
  }

  @Get('categories')
  async getCategories() {
    return this.materialsService.getCategories();
  }

  @Get('units')
  async getUnits() {
    return this.materialsService.getUnits();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.materialsService.findOne(id);
  }

  @Post()
  async create(
    @Body() createMaterialDto: CreateMaterialDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.materialsService.create(createMaterialDto, userId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMaterialDto: UpdateMaterialDto,
  ) {
    return this.materialsService.update(id, updateMaterialDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.materialsService.remove(id);
  }
}

