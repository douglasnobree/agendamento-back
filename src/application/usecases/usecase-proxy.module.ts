import { DynamicModule, Module } from '@nestjs/common';
import { ListTenantsUseCase } from '../../application/usecases/Tenants/tenant-useCase-list';
import { TenantRepositoryPostgres } from '../../infra/db/postgres/repositories/tenant.repository';
import { UseCaseProxy } from './usecase-proxy';
import { PostgresModule } from '../../infra/db/postgres/postgres.module';
import { CreateTenantUseCase } from '../../application/usecases/Tenants/tenant-useCase-create';
import { PostgresService } from '../../infra/db/postgres/postgres.service';
import { GetTenantByIdUseCase } from './Tenants/tenant-useCase-getById';
import { ServiceRepositoryPostgres } from '../../infra/db/postgres/repositories/service.repository';
import { ListServicesUseCase } from './Services/service-useCase-list';
import { GetServiceByIdUseCase } from './Services/service-useCase-getById';
import { CreateServiceUseCase } from './Services/service-useCase-create';
import { UpdateServiceUseCase } from './Services/service-useCase-update';
import { RemoveServiceUseCase } from './Services/service-useCase-remove';

@Module({
  imports: [PostgresModule],
})
export class UsecaseProxyModule {
  static LIST_TENANTS_USE_CASE = 'listTenantsUsecaseProxy';
  static CREATE_TENANT_USE_CASE = 'createTenantUsecaseProxy';
  static GET_TENANT_BY_ID_USE_CASE = 'getTenantByIdUsecaseProxy';
  static LIST_SERVICES_USE_CASE = 'listServicesUsecaseProxy';
  static GET_SERVICE_BY_ID_USE_CASE = 'getServiceByIdUsecaseProxy';
  static CREATE_SERVICE_USE_CASE = 'createServiceUsecaseProxy';
  static UPDATE_SERVICE_USE_CASE = 'updateServiceUsecaseProxy';
  static REMOVE_SERVICE_USE_CASE = 'removeServiceUsecaseProxy';

  static register(): DynamicModule {
    return {
      module: UsecaseProxyModule,
      providers: [
        {
          inject: [TenantRepositoryPostgres],
          provide: UsecaseProxyModule.LIST_TENANTS_USE_CASE,
          useFactory: (tenantRepository: TenantRepositoryPostgres) =>
            new UseCaseProxy(new ListTenantsUseCase(tenantRepository)),
        },
        {
          inject: [TenantRepositoryPostgres, PostgresService],
          provide: UsecaseProxyModule.CREATE_TENANT_USE_CASE,
          useFactory: (
            tenantRepository: TenantRepositoryPostgres,
            postgres: PostgresService,
          ) =>
            new UseCaseProxy(
              new CreateTenantUseCase(tenantRepository, postgres),
            ),
        },
        {
          inject: [TenantRepositoryPostgres],
          provide: UsecaseProxyModule.GET_TENANT_BY_ID_USE_CASE,
          useFactory: (tenantRepository: TenantRepositoryPostgres) =>
            new UseCaseProxy(new GetTenantByIdUseCase(tenantRepository)),
        },
        // --- SERVICES ---
        {
          inject: [ServiceRepositoryPostgres],
          provide: UsecaseProxyModule.LIST_SERVICES_USE_CASE,
          useFactory: (serviceRepository: ServiceRepositoryPostgres) =>
            new UseCaseProxy(new ListServicesUseCase(serviceRepository)),
        },
        {
          inject: [ServiceRepositoryPostgres],
          provide: UsecaseProxyModule.GET_SERVICE_BY_ID_USE_CASE,
          useFactory: (serviceRepository: ServiceRepositoryPostgres) =>
            new UseCaseProxy(new GetServiceByIdUseCase(serviceRepository)),
        },
        {
          inject: [ServiceRepositoryPostgres],
          provide: UsecaseProxyModule.CREATE_SERVICE_USE_CASE,
          useFactory: (serviceRepository: ServiceRepositoryPostgres) =>
            new UseCaseProxy(new CreateServiceUseCase(serviceRepository)),
        },
        {
          inject: [ServiceRepositoryPostgres],
          provide: UsecaseProxyModule.UPDATE_SERVICE_USE_CASE,
          useFactory: (serviceRepository: ServiceRepositoryPostgres) =>
            new UseCaseProxy(new UpdateServiceUseCase(serviceRepository)),
        },
        {
          inject: [ServiceRepositoryPostgres],
          provide: UsecaseProxyModule.REMOVE_SERVICE_USE_CASE,
          useFactory: (serviceRepository: ServiceRepositoryPostgres) =>
            new UseCaseProxy(new RemoveServiceUseCase(serviceRepository)),
        },
      ],
      exports: [
        UsecaseProxyModule.CREATE_TENANT_USE_CASE,
        UsecaseProxyModule.LIST_TENANTS_USE_CASE,
        UsecaseProxyModule.GET_TENANT_BY_ID_USE_CASE,
        UsecaseProxyModule.LIST_SERVICES_USE_CASE,
        UsecaseProxyModule.GET_SERVICE_BY_ID_USE_CASE,
        UsecaseProxyModule.CREATE_SERVICE_USE_CASE,
        UsecaseProxyModule.UPDATE_SERVICE_USE_CASE,
        UsecaseProxyModule.REMOVE_SERVICE_USE_CASE,
      ],
    };
  }
}
