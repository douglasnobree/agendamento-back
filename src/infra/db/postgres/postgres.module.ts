import { Module, Global } from '@nestjs/common';
import { PostgresService } from './postgres.service';
import { TenantService } from '../../prisma/tenant.service';
import { ConfigModule } from '@nestjs/config';
import { TenantRepositoryPostgres } from './repositories/tenant.repository';
import { ServiceRepositoryPostgres } from './repositories/service.repository';
import { ClientRepositoryPostgres } from './repositories/client.repository';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    PostgresService,
    TenantService,
    TenantRepositoryPostgres,
    ServiceRepositoryPostgres,
    ClientRepositoryPostgres,
    {
      provide: 'TenantRepository',
      useExisting: TenantRepositoryPostgres,
    },
    {
      provide: 'ServiceRepository',
      useExisting: ServiceRepositoryPostgres,
    },
    {
      provide: 'ClientRepository',
      useExisting: ClientRepositoryPostgres,
    },
  ],
  exports: [
    PostgresService,
    TenantService,
    TenantRepositoryPostgres,
    ServiceRepositoryPostgres,
    ClientRepositoryPostgres,
    'TenantRepository',
    'ServiceRepository',
    'ClientRepository',
  ],
})
export class PostgresModule {}
