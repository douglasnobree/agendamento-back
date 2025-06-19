import { Module, DynamicModule } from '@nestjs/common';
import { UseCaseProxy } from '../usecase-proxy';
import { CreateAvailableSlotUseCase } from './available-slot-useCase-create';
import { GetAvailableSlotByStaffIdUseCase } from './available-slot-useCase-getByStaffId';
import { GetAvailableTimeslotsUseCase } from './available-slot-useCase-getAvailableTimeslots';
import { PostgresModule } from '../../../infra/db/postgres/postgres.module';
import { PrismaModule } from '../../../infra/db/prisma/prisma.module';
import { AvailableSlotRepositoryPrisma } from '../../../infra/db/prisma/repositories/available-slot.repository';
import { ServiceRepositoryPrisma } from '../../../infra/db/prisma/repositories/service.repository';

@Module({
  imports: [PostgresModule, PrismaModule],
})
export class AvailableSlotUsecaseProxyModule {
  static CREATE_AVAILABLE_SLOT_USE_CASE = 'CreateAvailableSlotUseCaseProxy';
  static GET_AVAILABLE_SLOTS_BY_STAFF_ID_USE_CASE =
    'GetAvailableSlotByStaffIdUseCaseProxy';
  static GET_AVAILABLE_TIMESLOTS_USE_CASE = 'GetAvailableTimeslotsUseCaseProxy';

  static register(): DynamicModule {
    return {
      module: AvailableSlotUsecaseProxyModule,
      providers: [
        {
          inject: [AvailableSlotRepositoryPrisma],
          provide:
            AvailableSlotUsecaseProxyModule.CREATE_AVAILABLE_SLOT_USE_CASE,
          useFactory: (
            availableSlotRepository: AvailableSlotRepositoryPrisma,
          ) =>
            new UseCaseProxy(
              new CreateAvailableSlotUseCase(availableSlotRepository),
            ),
        },
        {
          inject: [AvailableSlotRepositoryPrisma],
          provide:
            AvailableSlotUsecaseProxyModule.GET_AVAILABLE_SLOTS_BY_STAFF_ID_USE_CASE,
          useFactory: (
            availableSlotRepository: AvailableSlotRepositoryPrisma,
          ) =>
            new UseCaseProxy(
              new GetAvailableSlotByStaffIdUseCase(availableSlotRepository),
            ),
        },
        {
          inject: [AvailableSlotRepositoryPrisma, ServiceRepositoryPrisma],
          provide:
            AvailableSlotUsecaseProxyModule.GET_AVAILABLE_TIMESLOTS_USE_CASE,
          useFactory: (
            availableSlotRepository: AvailableSlotRepositoryPrisma,
            serviceRepository: ServiceRepositoryPrisma,
          ) =>
            new UseCaseProxy(
              new GetAvailableTimeslotsUseCase(
                availableSlotRepository,
                serviceRepository,
              ),
            ),
        },
      ],
      exports: [
        AvailableSlotUsecaseProxyModule.CREATE_AVAILABLE_SLOT_USE_CASE,
        AvailableSlotUsecaseProxyModule.GET_AVAILABLE_SLOTS_BY_STAFF_ID_USE_CASE,
        AvailableSlotUsecaseProxyModule.GET_AVAILABLE_TIMESLOTS_USE_CASE,
      ],
    };
  }
}
