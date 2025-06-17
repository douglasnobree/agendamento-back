import { DynamicModule, Module } from '@nestjs/common';
import { TenantRepositoryPostgres } from '../../../infra/db/postgres/repositories/tenant.repository';
import { ListTenantsUseCase } from './tenant-useCase-list';
import { GetTenantByIdUseCase } from './tenant-useCase-getById';
import { GetTenantBySchemaUseCase } from './tenant-useCase-getBySchema';
import { CreateTenantUseCase } from './tenant-useCase-create';
import { UseCaseProxy } from '../usecase-proxy';
import { PostgresModule } from '../../../infra/db/postgres/postgres.module';

@Module({
  imports: [PostgresModule],
})
export class TenantUsecaseProxyModule {
  static LIST_TENANTS_USE_CASE = 'listTenantsUsecaseProxy';
  static CREATE_TENANT_USE_CASE = 'createTenantUsecaseProxy';
  static GET_TENANT_BY_ID_USE_CASE = 'getTenantByIdUsecaseProxy';
  static GET_TENANT_BY_SCHEMA_USE_CASE = 'getTenantBySchemaUsecaseProxy';

  static register(): DynamicModule {
    return {
      module: TenantUsecaseProxyModule,
      providers: [
        {
          inject: [TenantRepositoryPostgres],
          provide: TenantUsecaseProxyModule.LIST_TENANTS_USE_CASE,
          useFactory: (repo: TenantRepositoryPostgres) =>
            new UseCaseProxy(new ListTenantsUseCase(repo)),
        },
        {
          inject: [TenantRepositoryPostgres],
          provide: TenantUsecaseProxyModule.CREATE_TENANT_USE_CASE,
          useFactory: (repo: TenantRepositoryPostgres) =>
            new UseCaseProxy(new CreateTenantUseCase(repo)),
        },
        {
          inject: [TenantRepositoryPostgres],
          provide: TenantUsecaseProxyModule.GET_TENANT_BY_ID_USE_CASE,
          useFactory: (repo: TenantRepositoryPostgres) =>
            new UseCaseProxy(new GetTenantByIdUseCase(repo)),
        },
        {
          inject: [TenantRepositoryPostgres],
          provide: TenantUsecaseProxyModule.GET_TENANT_BY_SCHEMA_USE_CASE,
          useFactory: (repo: TenantRepositoryPostgres) =>
            new UseCaseProxy(new GetTenantBySchemaUseCase(repo)),
        },
      ],
      exports: [
        TenantUsecaseProxyModule.LIST_TENANTS_USE_CASE,
        TenantUsecaseProxyModule.CREATE_TENANT_USE_CASE,
        TenantUsecaseProxyModule.GET_TENANT_BY_ID_USE_CASE,
        TenantUsecaseProxyModule.GET_TENANT_BY_SCHEMA_USE_CASE,
      ],
    };
  }
}
