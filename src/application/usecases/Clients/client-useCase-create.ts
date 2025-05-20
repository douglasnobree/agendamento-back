import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ClientRepository } from '../../../domain/repositoriesInterface/client.repository-interface';
import { Client } from '../../../domain/entities/client.entity';

export type CreateClientInput = {
  email: string;
  name: string;
  phone?: string;
};

@Injectable()
export class CreateClientUseCase {
  constructor(
    @Inject('ClientRepository')
    private readonly clientRepository: ClientRepository,
  ) {}

  async execute(schema: string, input: CreateClientInput): Promise<Client> {
    if (!input.email || !input.name) {
      throw new BadRequestException('Nome e email são obrigatórios');
    }
    const client = Client.create(input.email, input.name, input.phone);
    await this.clientRepository.save(schema, client);
    return client;
  }
}
