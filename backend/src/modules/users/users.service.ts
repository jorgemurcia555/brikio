import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['subscription', 'subscription.plan'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['subscription', 'subscription.plan'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    Object.assign(user, updateUserDto);

    return this.usersRepository.save(user);
  }

  async completeOnboarding(
    id: string,
    completeOnboardingDto: CompleteOnboardingDto,
  ): Promise<User> {
    const user = await this.findOne(id);

    user.preferences = {
      currency: completeOnboardingDto.currency,
      taxRate: completeOnboardingDto.taxRate,
      defaultUnit: completeOnboardingDto.defaultUnit,
      language: completeOnboardingDto.language || 'es',
    };

    user.onboardingCompleted = true;

    return this.usersRepository.save(user);
  }

  async getProfile(id: string) {
    const user = await this.findOne(id);
    const { password, refreshToken, ...profile } = user;
    return profile;
  }
}

