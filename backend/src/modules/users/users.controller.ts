import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Put('me')
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(userId, updateUserDto);
  }

  @Patch('onboarding')
  async completeOnboarding(
    @CurrentUser('id') userId: string,
    @Body() completeOnboardingDto: CompleteOnboardingDto,
  ) {
    return this.usersService.completeOnboarding(userId, completeOnboardingDto);
  }
}

