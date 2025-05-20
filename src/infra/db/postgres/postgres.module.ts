import { Module, Global } from '@nestjs/common';
import { PostgresService } from './postgres.service';
import { TenantService } from '../../prisma/tenant.service';
import { ConfigModule } from '@nestjs/config';
import { TenantRepositoryPostgres } from './repositories/tenant.repository';
import { ServiceRepositoryPostgres } from './repositories/service.repository';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    PostgresService,
    TenantService,
    TenantRepositoryPostgres,
    ServiceRepositoryPostgres,
    {
      provide: 'TenantRepository',
      useExisting: TenantRepositoryPostgres,
    },
    {
      provide: 'ServiceRepository',
      useExisting: ServiceRepositoryPostgres,
    },
  ],
  exports: [
    PostgresService,
    TenantService,
    TenantRepositoryPostgres,
    ServiceRepositoryPostgres,
    'TenantRepository',
    'ServiceRepository',
  ],
})
export class PostgresModule {}
