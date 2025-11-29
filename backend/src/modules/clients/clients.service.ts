import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../../database/entities/client.entity';
import { User } from '../../database/entities/user.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
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

  async create(createClientDto: CreateClientDto, userId: string): Promise<Client> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const client = this.clientsRepository.create({
      ...createClientDto,
      user,
    });

    return this.clientsRepository.save(client);
  }

  async update(id: string, updateClientDto: UpdateClientDto, userId: string): Promise<Client> {
    const client = await this.clientsRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    Object.assign(client, updateClientDto);
    return this.clientsRepository.save(client);
  }

  async remove(id: string, userId: string): Promise<void> {
    const client = await this.clientsRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    await this.clientsRepository.remove(client);
  }
}

