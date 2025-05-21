import { Module, Global } from '@nestjs/common';
import { PostgresService } from './postgres.service';
import { ConfigModule } from '@nestjs/config';
import { TenantRepositoryPostgres } from './repositories/tenant.repository';
import { ServiceRepositoryPostgres } from './repositories/service.repository';
import { ClientRepositoryPostgres } from './repositories/client.repository';
import { StaffRepositoryPostgres } from './repositories/staff.repository';
import { AppointmentRepositoryPostgres } from './repositories/appointment.repository';
import { PlanRepositoryPostgres } from './repositories/plan.repository';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    PostgresService,
    TenantRepositoryPostgres,
    ServiceRepositoryPostgres,
    ClientRepositoryPostgres,
    StaffRepositoryPostgres,
    AppointmentRepositoryPostgres,
    PlanRepositoryPostgres,
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
    {
      provide: 'AppointmentRepository',
      useExisting: AppointmentRepositoryPostgres,
    },
  ],
  exports: [
    PostgresService,
    TenantRepositoryPostgres,
    ServiceRepositoryPostgres,
    ClientRepositoryPostgres,
    StaffRepositoryPostgres,
    AppointmentRepositoryPostgres,
    PlanRepositoryPostgres,
    'TenantRepository',
    'ServiceRepository',
    'ClientRepository',
    'StaffRepository',
    'AppointmentRepository',
  ],
})
export class PostgresModule {}
