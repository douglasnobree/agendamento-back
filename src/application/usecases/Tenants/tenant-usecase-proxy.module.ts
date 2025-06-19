import { DynamicModule, Module } from '@nestjs/common';
import { TenantRepositoryPostgres } from '../../../infra/db/postgres/repositories/tenant.repository';
import { ListTenantsUseCase } from './tenant-useCase-list';
import { GetTenantByIdUseCase } from './tenant-useCase-getById';
import { GetTenantBySchemaUseCase } from './tenant-useCase-getBySchema';
import { CreateTenantUseCase } from './tenant-useCase-create';
import { UseCaseProxy } from '../usecase-proxy';
import { PostgresModule } from '../../../infra/db/postgres/postgres.module';
import { PrismaModule } from '../../../infra/db/prisma/prisma.module';
import { TenantRepositoryPrisma } from '../../../infra/db/prisma/repositories/tenant.repository';

@Module({
  imports: [PostgresModule, PrismaModule],
})
export class TenantUsecaseProxyModule {
  static LIST_TENANTS_USE_CASE = 'listTenantsUsecaseProxy';
  static CREATE_TENANT_USE_CASE = 'createTenantUsecaseProxy';
  static GET_TENANT_BY_ID_USE_CASE = 'getTenantByIdUsecaseProxy';
  static GET_TENANT_BY_SCHEMA_USE_CASE = 'getTenantBySchemaUsecaseProxy';

  static register(): DynamicModule {
    return {
      module: TenantUsecaseProxyModule,      providers: [
        {
          inject: [TenantRepositoryPrisma],
          provide: TenantUsecaseProxyModule.LIST_TENANTS_USE_CASE,
          useFactory: (repo: TenantRepositoryPrisma) =>
            new UseCaseProxy(new ListTenantsUseCase(repo)),
        },
        {
          inject: [TenantRepositoryPrisma],
          provide: TenantUsecaseProxyModule.CREATE_TENANT_USE_CASE,
          useFactory: (repo: TenantRepositoryPrisma) => {
            return new UseCaseProxy(new CreateTenantUseCase(repo));
          },
        },
        {
          inject: [TenantRepositoryPrisma],
          provide: TenantUsecaseProxyModule.GET_TENANT_BY_ID_USE_CASE,
          useFactory: (repo: TenantRepositoryPrisma) =>
            new UseCaseProxy(new GetTenantByIdUseCase(repo)),
        },
        {
          inject: [TenantRepositoryPrisma],
          provide: TenantUsecaseProxyModule.GET_TENANT_BY_SCHEMA_USE_CASE,
          useFactory: (repo: TenantRepositoryPrisma) =>
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
