import { DynamicModule, Module } from '@nestjs/common';
import { ListTenantsUseCase } from '../../application/usecases/Tenants/tenant-useCase-list';
import { TenantRepositoryPostgres } from '../../infra/db/postgres/repositories/tenant.repository';
import { UseCaseProxy } from './usecase-proxy';
import { PostgresModule } from '../../infra/db/postgres/postgres.module';
import { CreateTenantUseCase } from '../../application/usecases/Tenants/tenant-useCase-create';
import { PostgresService } from '../../infra/db/postgres/postgres.service';
import { GetTenantByIdUseCase } from './Tenants/tenant-useCase-getById';

@Module({
  imports: [PostgresModule],
})
export class UsecaseProxyModule {
  static LIST_TENANTS_USE_CASE = 'listTenantsUsecaseProxy';
  static CREATE_TENANT_USE_CASE = 'createTenantUsecaseProxy';
  static GET_TENANT_BY_ID_USE_CASE = 'getTenantByIdUsecaseProxy';

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
      ],
      exports: [
        UsecaseProxyModule.CREATE_TENANT_USE_CASE,
        UsecaseProxyModule.LIST_TENANTS_USE_CASE,
        UsecaseProxyModule.GET_TENANT_BY_ID_USE_CASE,
      ],
    };
  }
}
