import { DynamicModule, Module } from '@nestjs/common';
import { AppointmentRepositoryPostgres } from '../../../infra/db/postgres/repositories/appointment.repository';
import { ListAppointmentsUseCase } from './appointment-useCase-list';
import { GetAppointmentByIdUseCase } from './appointment-useCase-getById';
import { CreateAppointmentUseCase } from './appointment-useCase-create';
import { UpdateAppointmentUseCase } from './appointment-useCase-update';
import { RemoveAppointmentUseCase } from './appointment-useCase-remove';
import { GetAppointmentByClientIdUseCase } from './appointment-useCase-getByClientId';
import { UseCaseProxy } from '../usecase-proxy';
import { PostgresModule } from '../../../infra/db/postgres/postgres.module';

@Module({
  imports: [PostgresModule],
})
export class AppointmentUsecaseProxyModule {
  static LIST_APPOINTMENTS_USE_CASE = 'listAppointmentsUsecaseProxy';
  static GET_APPOINTMENT_BY_ID_USE_CASE = 'getAppointmentByIdUsecaseProxy';
  static CREATE_APPOINTMENT_USE_CASE = 'createAppointmentUsecaseProxy';
  static UPDATE_APPOINTMENT_USE_CASE = 'updateAppointmentUsecaseProxy';
  static REMOVE_APPOINTMENT_USE_CASE = 'removeAppointmentUsecaseProxy';
  static GET_APPOINTMENT_BY_CLIENTID_USE_CASE =
    'getAppointmentByClientIdUsecaseProxy';

  static register(): DynamicModule {
    return {
      module: AppointmentUsecaseProxyModule,
      providers: [
        {
          inject: [AppointmentRepositoryPostgres],
          provide: AppointmentUsecaseProxyModule.LIST_APPOINTMENTS_USE_CASE,
          useFactory: (repo: AppointmentRepositoryPostgres) =>
            new UseCaseProxy(new ListAppointmentsUseCase(repo)),
        },
        {
          inject: [AppointmentRepositoryPostgres],
          provide: AppointmentUsecaseProxyModule.GET_APPOINTMENT_BY_ID_USE_CASE,
          useFactory: (repo: AppointmentRepositoryPostgres) =>
            new UseCaseProxy(new GetAppointmentByIdUseCase(repo)),
        },
        {
          inject: [AppointmentRepositoryPostgres],
          provide: AppointmentUsecaseProxyModule.CREATE_APPOINTMENT_USE_CASE,
          useFactory: (repo: AppointmentRepositoryPostgres) =>
            new UseCaseProxy(new CreateAppointmentUseCase(repo)),
        },
        {
          inject: [AppointmentRepositoryPostgres],
          provide: AppointmentUsecaseProxyModule.UPDATE_APPOINTMENT_USE_CASE,
          useFactory: (repo: AppointmentRepositoryPostgres) =>
            new UseCaseProxy(new UpdateAppointmentUseCase(repo)),
        },
        {
          inject: [AppointmentRepositoryPostgres],
          provide: AppointmentUsecaseProxyModule.REMOVE_APPOINTMENT_USE_CASE,
          useFactory: (repo: AppointmentRepositoryPostgres) =>
            new UseCaseProxy(new RemoveAppointmentUseCase(repo)),
        },
        {
          inject: [AppointmentRepositoryPostgres],
          provide:
            AppointmentUsecaseProxyModule.GET_APPOINTMENT_BY_CLIENTID_USE_CASE,
          useFactory: (repo: AppointmentRepositoryPostgres) =>
            new UseCaseProxy(new GetAppointmentByClientIdUseCase(repo)),
        },
      ],
      exports: [
        AppointmentUsecaseProxyModule.LIST_APPOINTMENTS_USE_CASE,
        AppointmentUsecaseProxyModule.GET_APPOINTMENT_BY_ID_USE_CASE,
        AppointmentUsecaseProxyModule.CREATE_APPOINTMENT_USE_CASE,
        AppointmentUsecaseProxyModule.UPDATE_APPOINTMENT_USE_CASE,
        AppointmentUsecaseProxyModule.REMOVE_APPOINTMENT_USE_CASE,
        AppointmentUsecaseProxyModule.GET_APPOINTMENT_BY_CLIENTID_USE_CASE,
      ],
    };
  }
}
