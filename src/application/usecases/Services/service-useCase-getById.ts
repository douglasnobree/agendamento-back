import { Injectable, Inject } from '@nestjs/common';
import { ServiceRepository } from '../../../domain/repositoriesInterface/service.repository-interface';
import { Service } from '../../../domain/entities/service.entity';
import { UseCase } from '../useCase';
import { SchemaIdDto } from '../../dtos/common.dto';

@Injectable()
export class GetServiceByIdUseCase
  implements UseCase<SchemaIdDto, Service | null>
{
  constructor(
    @Inject('ServiceRepository')
    private readonly serviceRepository: ServiceRepository,
  ) {}

  async execute(input: SchemaIdDto): Promise<Service | null> {
    const { schema, id } = input;
    return this.serviceRepository.findById(schema, id);
  }
}
