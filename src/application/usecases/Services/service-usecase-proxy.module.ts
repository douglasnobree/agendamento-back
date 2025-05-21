import { DynamicModule, Module } from '@nestjs/common';
import { ServiceRepositoryPostgres } from '../../../infra/db/postgres/repositories/service.repository';
import { ListServicesUseCase } from './service-useCase-list';
import { GetServiceByIdUseCase } from './service-useCase-getById';
import { CreateServiceUseCase } from './service-useCase-create';
import { UpdateServiceUseCase } from './service-useCase-update';
import { RemoveServiceUseCase } from './service-useCase-remove';
import { UseCaseProxy } from '../usecase-proxy';
import { PostgresModule } from '../../../infra/db/postgres/postgres.module';

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
          inject: [ServiceRepositoryPostgres],
          provide: ServiceUsecaseProxyModule.LIST_SERVICES_USE_CASE,
          useFactory: (repo: ServiceRepositoryPostgres) =>
            new UseCaseProxy(new ListServicesUseCase(repo)),
        },
        {
          inject: [ServiceRepositoryPostgres],
          provide: ServiceUsecaseProxyModule.GET_SERVICE_BY_ID_USE_CASE,
          useFactory: (repo: ServiceRepositoryPostgres) =>
            new UseCaseProxy(new GetServiceByIdUseCase(repo)),
        },
        {
          inject: [ServiceRepositoryPostgres],
          provide: ServiceUsecaseProxyModule.CREATE_SERVICE_USE_CASE,
          useFactory: (repo: ServiceRepositoryPostgres) =>
            new UseCaseProxy(new CreateServiceUseCase(repo)),
        },
        {
          inject: [ServiceRepositoryPostgres],
          provide: ServiceUsecaseProxyModule.UPDATE_SERVICE_USE_CASE,
          useFactory: (repo: ServiceRepositoryPostgres) =>
            new UseCaseProxy(new UpdateServiceUseCase(repo)),
        },
        {
          inject: [ServiceRepositoryPostgres],
          provide: ServiceUsecaseProxyModule.REMOVE_SERVICE_USE_CASE,
          useFactory: (repo: ServiceRepositoryPostgres) =>
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
