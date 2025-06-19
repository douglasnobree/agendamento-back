import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ClientRepositoryPrisma } from './repositories/client.repository';
import { AppointmentRepositoryPrisma } from './repositories/appointment.repository';
import { OwnerRepositoryPrisma } from './repositories/owner.repository';
import { PlanRepositoryPrisma } from './repositories/plan.repository';
import { PlatformAdminRepositoryPrisma } from './repositories/platform-admin.repository';
import { ServiceRepositoryPrisma } from './repositories/service.repository';
import { StaffRepositoryPrisma } from './repositories/staff.repository';
import { TenantRepositoryPrisma } from './repositories/tenant.repository';
import { AvailableSlotRepositoryPrisma } from './repositories/available-slot.repository';

@Global()
@Module({
  providers: [
    PrismaService,
    ClientRepositoryPrisma,
    AppointmentRepositoryPrisma,
    OwnerRepositoryPrisma,
    PlanRepositoryPrisma,
    PlatformAdminRepositoryPrisma,
    ServiceRepositoryPrisma,
    StaffRepositoryPrisma,
    TenantRepositoryPrisma,
    AvailableSlotRepositoryPrisma,
  ],
  exports: [
    PrismaService,
    ClientRepositoryPrisma,
    AppointmentRepositoryPrisma,
    OwnerRepositoryPrisma,
    PlanRepositoryPrisma,
    PlatformAdminRepositoryPrisma,
    ServiceRepositoryPrisma,
    StaffRepositoryPrisma,
    TenantRepositoryPrisma,
    AvailableSlotRepositoryPrisma,
  ],
})
export class PrismaModule {}
