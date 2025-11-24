import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('templates')
@UseGuards(JwtAuthGuard)
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  async findAll(@CurrentUser('id') userId: string) {
    return this.templatesService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.templatesService.findOne(id);
  }
}

