import { DynamicModule, Module } from '@nestjs/common';
import { ListTenantsUseCase } from '../../application/usecases/Tenants/tenant-useCase-list';
import { TenantRepositoryPostgres } from '../../infra/db/postgres/repositories/tenant.repository';
import { UseCaseProxy } from './usecase-proxy';
import { PostgresModule } from '../../infra/db/postgres/postgres.module';

@Module({
  imports: [PostgresModule],
})
export class UsecaseProxyModule {
  static LIST_TENANTS_USE_CASE = 'listTenantsUsecaseProxy';

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
      ],
      exports: [UsecaseProxyModule.LIST_TENANTS_USE_CASE],
    };
  }
}
