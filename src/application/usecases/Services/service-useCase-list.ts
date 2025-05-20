import { Injectable, Inject } from '@nestjs/common';
import { ServiceRepository } from '../../../domain/repositoriesInterface/service.repository-interface';
import { Service } from '../../../domain/entities/service.entity';

@Injectable()
export class ListServicesUseCase {
  constructor(
    @Inject('ServiceRepository')
    private readonly serviceRepository: ServiceRepository,
  ) {}

  async execute(schema: string): Promise<Service[]> {
    return this.serviceRepository.findAll(schema);
  }
}
