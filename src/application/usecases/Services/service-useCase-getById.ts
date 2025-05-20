import { Injectable, Inject } from '@nestjs/common';
import { ServiceRepository } from '../../../domain/repositoriesInterface/service.repository-interface';
import { Service } from '../../../domain/entities/service.entity';

@Injectable()
export class GetServiceByIdUseCase {
  constructor(
    @Inject('ServiceRepository')
    private readonly serviceRepository: ServiceRepository,
  ) {}

  async execute(schema: string, id: string): Promise<Service | null> {
    return this.serviceRepository.findById(schema, id);
  }
}
