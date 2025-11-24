import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../../database/entities/client.entity';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
  ) {}

  async findAll(userId: string): Promise<Client[]> {
    return this.clientsRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Client> {
    const client = await this.clientsRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['projects'],
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }

  // Additional CRUD methods...
}

