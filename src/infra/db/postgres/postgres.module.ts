import { Module, Global } from '@nestjs/common';
import { PostgresService } from './postgres.service';
import { TenantService } from '../../prisma/tenant.service';
import { ConfigModule } from '@nestjs/config';
import { TenantRepositoryPostgres } from './repositories/tenant.repository';
import { ServiceRepositoryPostgres } from './repositories/service.repository';
import { ClientRepositoryPostgres } from './repositories/client.repository';
import { StaffRepositoryPostgres } from './repositories/staff.repository';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    PostgresService,
    TenantService,
    TenantRepositoryPostgres,
    ServiceRepositoryPostgres,
    ClientRepositoryPostgres,
    StaffRepositoryPostgres,
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
    {
      provide: 'StaffRepository',
      useExisting: StaffRepositoryPostgres,
    },
  ],
  exports: [
    PostgresService,
    TenantService,
    TenantRepositoryPostgres,
    ServiceRepositoryPostgres,
    ClientRepositoryPostgres,
    StaffRepositoryPostgres,
    'TenantRepository',
    'ServiceRepository',
    'ClientRepository',
    'StaffRepository',
  ],
})
export class PostgresModule {}
