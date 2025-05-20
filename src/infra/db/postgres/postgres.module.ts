import { Module, Global } from '@nestjs/common';
import { PostgresService } from './postgres.service';
import { TenantService } from '../../prisma/tenant.service';
import { ConfigModule } from '@nestjs/config';
import { TenantRepositoryPostgres } from './repositories/tenant.repository';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    PostgresService,
    TenantService,
    TenantRepositoryPostgres,
    {
      provide: 'TenantRepository',
      useExisting: TenantRepositoryPostgres,
    },
  ],
  exports: [
    PostgresService,
    TenantService,
    TenantRepositoryPostgres,
    'TenantRepository',
  ],
})
export class PostgresModule {}
