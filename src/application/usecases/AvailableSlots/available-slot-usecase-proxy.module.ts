import { Module, DynamicModule } from '@nestjs/common';
import { UseCaseProxy } from '../usecase-proxy';
import { CreateAvailableSlotUseCase } from './available-slot-useCase-create';
import { GetAvailableSlotByStaffIdUseCase } from './available-slot-useCase-getByStaffId';
import { GetAvailableTimeslotsUseCase } from './available-slot-useCase-getAvailableTimeslots';
import { UpdateAvailableSlotUseCase } from './available-slot-useCase-update';
import { DeleteAvailableSlotUseCase } from './available-slot-useCase-delete';
import { PostgresModule } from '../../../infra/db/postgres/postgres.module';
import { PrismaModule } from '../../../infra/db/prisma/prisma.module';
import { AvailableSlotRepositoryPrisma } from '../../../infra/db/prisma/repositories/available-slot.repository';
import { ServiceRepositoryPrisma } from '../../../infra/db/prisma/repositories/service.repository';
import { AvailableSlotRepositoryPostgres } from 'src/infra/db/postgres/repositories/available-slot.repository';
import { ServiceRepositoryPostgres } from 'src/infra/db/postgres/repositories/service.repository';

@Module({
  imports: [PostgresModule, PrismaModule],
})
export class AvailableSlotUsecaseProxyModule {
  static CREATE_AVAILABLE_SLOT_USE_CASE = 'CreateAvailableSlotUseCaseProxy';
  static GET_AVAILABLE_SLOTS_BY_STAFF_ID_USE_CASE =
    'GetAvailableSlotByStaffIdUseCaseProxy';
  static GET_AVAILABLE_TIMESLOTS_USE_CASE = 'GetAvailableTimeslotsUseCaseProxy';
  static UPDATE_AVAILABLE_SLOT_USE_CASE = 'UpdateAvailableSlotUseCaseProxy';
  static DELETE_AVAILABLE_SLOT_USE_CASE = 'DeleteAvailableSlotUseCaseProxy';

  static register(): DynamicModule {
    return {
      module: AvailableSlotUsecaseProxyModule,
      providers: [
        {
          inject: [AvailableSlotRepositoryPostgres],
          provide:
            AvailableSlotUsecaseProxyModule.CREATE_AVAILABLE_SLOT_USE_CASE,
          useFactory: (
            availableSlotRepository: AvailableSlotRepositoryPostgres,
          ) =>
            new UseCaseProxy(
              new CreateAvailableSlotUseCase(availableSlotRepository),
            ),
        },
        {
          inject: [AvailableSlotRepositoryPostgres],
          provide:
            AvailableSlotUsecaseProxyModule.GET_AVAILABLE_SLOTS_BY_STAFF_ID_USE_CASE,
          useFactory: (
            availableSlotRepository: AvailableSlotRepositoryPostgres,
          ) =>
            new UseCaseProxy(
              new GetAvailableSlotByStaffIdUseCase(availableSlotRepository),
            ),
        },
        {
          inject: [AvailableSlotRepositoryPostgres, ServiceRepositoryPostgres],
          provide:
            AvailableSlotUsecaseProxyModule.GET_AVAILABLE_TIMESLOTS_USE_CASE,
          useFactory: (
            availableSlotRepository: AvailableSlotRepositoryPostgres,
            serviceRepository: ServiceRepositoryPostgres,
          ) =>
            new UseCaseProxy(
              new GetAvailableTimeslotsUseCase(
                availableSlotRepository,
                serviceRepository,
              ),
            ),
        },
        {
          inject: [AvailableSlotRepositoryPostgres],
          provide:
            AvailableSlotUsecaseProxyModule.UPDATE_AVAILABLE_SLOT_USE_CASE,
          useFactory: (
            availableSlotRepository: AvailableSlotRepositoryPostgres,
          ) =>
            new UseCaseProxy(
              new UpdateAvailableSlotUseCase(availableSlotRepository),
            ),
        },
        {
          inject: [AvailableSlotRepositoryPostgres],
          provide:
            AvailableSlotUsecaseProxyModule.DELETE_AVAILABLE_SLOT_USE_CASE,
          useFactory: (
            availableSlotRepository: AvailableSlotRepositoryPostgres,
          ) =>
            new UseCaseProxy(
              new DeleteAvailableSlotUseCase(availableSlotRepository),
            ),
        },
      ],
      exports: [
        AvailableSlotUsecaseProxyModule.CREATE_AVAILABLE_SLOT_USE_CASE,
        AvailableSlotUsecaseProxyModule.GET_AVAILABLE_SLOTS_BY_STAFF_ID_USE_CASE,
        AvailableSlotUsecaseProxyModule.GET_AVAILABLE_TIMESLOTS_USE_CASE,
        AvailableSlotUsecaseProxyModule.UPDATE_AVAILABLE_SLOT_USE_CASE,
        AvailableSlotUsecaseProxyModule.DELETE_AVAILABLE_SLOT_USE_CASE,
      ],
    };
  }
}
