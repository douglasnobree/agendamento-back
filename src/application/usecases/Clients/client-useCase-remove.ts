import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ClientRepository } from '../../../domain/repositoriesInterface/client.repository-interface';
import { UseCase } from '../useCase';
import { SchemaIdDto } from '../../dtos/common.dto';

@Injectable()
export class RemoveClientUseCase implements UseCase<SchemaIdDto, void> {
  constructor(
    @Inject('ClientRepository')
    private readonly clientRepository: ClientRepository,
  ) {}

  async execute(input: SchemaIdDto): Promise<void> {
    const { schema, id } = input;
    const existing = await this.clientRepository.findById(schema, id);
    if (!existing) throw new NotFoundException('Cliente não encontrado');
    await this.clientRepository.remove(schema, id);
  }
}
