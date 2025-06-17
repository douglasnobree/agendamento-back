import { DynamicModule, Module } from '@nestjs/common';
import { ServiceRepositoryPostgres } from '../../../infra/db/postgres/repositories/service.repository';
import { ListServicesUseCase } from './service-useCase-list';
import { GetServiceByIdUseCase } from './service-useCase-getById';
import { CreateServiceUseCase } from './service-useCase-create';
import { UpdateServiceUseCase } from './service-useCase-update';
import { RemoveServiceUseCase } from './service-useCase-remove';
import { UseCaseProxy } from '../usecase-proxy';
import { PostgresModule } from '../../../infra/db/postgres/postgres.module';
import { ServiceRepositoryPrisma } from 'src/infra/db/prisma/repositories/service.repository';

@Module({
  imports: [PostgresModule],
})
export class ServiceUsecaseProxyModule {
  static LIST_SERVICES_USE_CASE = 'listServicesUsecaseProxy';
  static GET_SERVICE_BY_ID_USE_CASE = 'getServiceByIdUsecaseProxy';
  static CREATE_SERVICE_USE_CASE = 'createServiceUsecaseProxy';
  static UPDATE_SERVICE_USE_CASE = 'updateServiceUsecaseProxy';
  static REMOVE_SERVICE_USE_CASE = 'removeServiceUsecaseProxy';

  static register(): DynamicModule {
    return {
      module: ServiceUsecaseProxyModule,
      providers: [
        {
          inject: [ServiceRepositoryPrisma],
          provide: ServiceUsecaseProxyModule.LIST_SERVICES_USE_CASE,
          useFactory: (repo: ServiceRepositoryPrisma) =>
            new UseCaseProxy(new ListServicesUseCase(repo)),
        },
        {
          inject: [ServiceRepositoryPrisma],
          provide: ServiceUsecaseProxyModule.GET_SERVICE_BY_ID_USE_CASE,
          useFactory: (repo: ServiceRepositoryPrisma) =>
            new UseCaseProxy(new GetServiceByIdUseCase(repo)),
        },
        {
          inject: [ServiceRepositoryPrisma],
          provide: ServiceUsecaseProxyModule.CREATE_SERVICE_USE_CASE,
          useFactory: (repo: ServiceRepositoryPrisma) =>
            new UseCaseProxy(new CreateServiceUseCase(repo)),
        },
        {
          inject: [ServiceRepositoryPrisma],
          provide: ServiceUsecaseProxyModule.UPDATE_SERVICE_USE_CASE,
          useFactory: (repo: ServiceRepositoryPrisma) =>
            new UseCaseProxy(new UpdateServiceUseCase(repo)),
        },
        {
          inject: [ServiceRepositoryPrisma],
          provide: ServiceUsecaseProxyModule.REMOVE_SERVICE_USE_CASE,
          useFactory: (repo: ServiceRepositoryPrisma) =>
            new UseCaseProxy(new RemoveServiceUseCase(repo)),
        },
      ],
      exports: [
        ServiceUsecaseProxyModule.LIST_SERVICES_USE_CASE,
        ServiceUsecaseProxyModule.GET_SERVICE_BY_ID_USE_CASE,
        ServiceUsecaseProxyModule.CREATE_SERVICE_USE_CASE,
        ServiceUsecaseProxyModule.UPDATE_SERVICE_USE_CASE,
        ServiceUsecaseProxyModule.REMOVE_SERVICE_USE_CASE,
      ],
    };
  }
}
