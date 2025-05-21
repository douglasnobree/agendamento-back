import { Injectable, Inject } from '@nestjs/common';
import { ServiceRepository } from '../../../domain/repositoriesInterface/service.repository-interface';
import { Service } from '../../../domain/entities/service.entity';
import { UseCase } from '../useCase';
import { SchemaDto } from '../../dtos/common.dto';

@Injectable()
export class ListServicesUseCase implements UseCase<SchemaDto, Service[]> {
  constructor(
    @Inject('ServiceRepository')
    private readonly serviceRepository: ServiceRepository,
  ) {}

  async execute(input: SchemaDto): Promise<Service[]> {
    return this.serviceRepository.findAll(input.schema);
  }
}
