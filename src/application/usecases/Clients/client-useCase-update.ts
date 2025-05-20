import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ClientRepository } from '../../../domain/repositoriesInterface/client.repository-interface';
import { Client } from '../../../domain/entities/client.entity';

export type UpdateClientInput = {
  id: string;
  email?: string;
  name?: string;
  phone?: string;
};

@Injectable()
export class UpdateClientUseCase {
  constructor(
    @Inject('ClientRepository')
    private readonly clientRepository: ClientRepository,
  ) {}

  async execute(schema: string, input: UpdateClientInput): Promise<Client> {
    const existing = await this.clientRepository.findById(schema, input.id);
    if (!existing) throw new NotFoundException('Cliente não encontrado');
    const updated = Client.fromPersistence({
      ...existing.toPersistence(),
      ...input,
    });
    await this.clientRepository.update(schema, updated);
    return updated;
  }
}
