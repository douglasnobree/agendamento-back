import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ServiceRepository } from '../../../domain/repositoriesInterface/service.repository-interface';
import { UseCase } from '../useCase';
import { SchemaIdDto } from '../../dtos/common.dto';

@Injectable()
export class RemoveServiceUseCase implements UseCase<SchemaIdDto, void> {
  constructor(
    @Inject('ServiceRepository')
    private readonly serviceRepository: ServiceRepository,
  ) {}

  async execute(input: SchemaIdDto): Promise<void> {
    const { schema, id } = input;
    const existing = await this.serviceRepository.findById(schema, id);
    if (!existing) throw new NotFoundException('Serviço não encontrado');
    await this.serviceRepository.remove(schema, id);
  }
}
