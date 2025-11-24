import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  async findAll(@CurrentUser('id') userId: string) {
    return this.clientsService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.clientsService.findOne(id, userId);
  }
}

