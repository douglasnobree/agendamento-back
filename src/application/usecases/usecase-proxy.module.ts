import { DynamicModule, Module } from '@nestjs/common';
import { ListTenantsUseCase } from '../../application/usecases/Tenants/tenant-useCase-list';
import { TenantRepositoryPostgres } from '../../infra/db/postgres/repositories/tenant.repository';
import { UseCaseProxy } from './usecase-proxy';
import { PostgresModule } from '../../infra/db/postgres/postgres.module';
import { CreateTenantUseCase } from '../../application/usecases/Tenants/tenant-useCase-create';
import { PostgresService } from '../../infra/db/postgres/postgres.service';
import { GetTenantByIdUseCase } from './Tenants/tenant-useCase-getById';
import { ServiceRepositoryPostgres } from '../../infra/db/postgres/repositories/service.repository';
import { ListServicesUseCase } from './Services/service-useCase-list';
import { GetServiceByIdUseCase } from './Services/service-useCase-getById';
import { CreateServiceUseCase } from './Services/service-useCase-create';
import { UpdateServiceUseCase } from './Services/service-useCase-update';
import { RemoveServiceUseCase } from './Services/service-useCase-remove';
import { ClientRepositoryPostgres } from '../../infra/db/postgres/repositories/client.repository';
import { ListClientsUseCase } from './Clients/client-useCase-list';
import { GetClientByIdUseCase } from './Clients/client-useCase-getById';
import { CreateClientUseCase } from './Clients/client-useCase-create';
import { UpdateClientUseCase } from './Clients/client-useCase-update';
import { RemoveClientUseCase } from './Clients/client-useCase-remove';
import { StaffRepositoryPostgres } from '../../infra/db/postgres/repositories/staff.repository';
import { ListStaffUseCase } from './Staff/staff-useCase-list';
import { GetStaffByIdUseCase } from './Staff/staff-useCase-getById';
import { CreateStaffUseCase } from './Staff/staff-useCase-create';
import { UpdateStaffUseCase } from './Staff/staff-useCase-update';
import { RemoveStaffUseCase } from './Staff/staff-useCase-remove';
import { AppointmentRepositoryPostgres } from '../../infra/db/postgres/repositories/appointment.repository';
import { ListAppointmentsUseCase } from './Appointments/appointment-useCase-list';
import { GetAppointmentByIdUseCase } from './Appointments/appointment-useCase-getById';
import { CreateAppointmentUseCase } from './Appointments/appointment-useCase-create';
import { UpdateAppointmentUseCase } from './Appointments/appointment-useCase-update';
import { RemoveAppointmentUseCase } from './Appointments/appointment-useCase-remove';
import { GetAppointmentByClientIdUseCase } from './Appointments/appointment-useCase-getByClientId';

@Module({
  imports: [PostgresModule],
})
export class UsecaseProxyModule {
  static LIST_TENANTS_USE_CASE = 'listTenantsUsecaseProxy';
  static CREATE_TENANT_USE_CASE = 'createTenantUsecaseProxy';
  static GET_TENANT_BY_ID_USE_CASE = 'getTenantByIdUsecaseProxy';
  static LIST_SERVICES_USE_CASE = 'listServicesUsecaseProxy';
  static GET_SERVICE_BY_ID_USE_CASE = 'getServiceByIdUsecaseProxy';
  static CREATE_SERVICE_USE_CASE = 'createServiceUsecaseProxy';
  static UPDATE_SERVICE_USE_CASE = 'updateServiceUsecaseProxy';
  static REMOVE_SERVICE_USE_CASE = 'removeServiceUsecaseProxy';
  static LIST_CLIENTS_USE_CASE = 'listClientsUsecaseProxy';
  static GET_CLIENT_BY_ID_USE_CASE = 'getClientByIdUsecaseProxy';
  static CREATE_CLIENT_USE_CASE = 'createClientUsecaseProxy';
  static UPDATE_CLIENT_USE_CASE = 'updateClientUsecaseProxy';
  static REMOVE_CLIENT_USE_CASE = 'removeClientUsecaseProxy';
  static LIST_STAFF_USE_CASE = 'listStaffUsecaseProxy';
  static GET_STAFF_BY_ID_USE_CASE = 'getStaffByIdUsecaseProxy';
  static CREATE_STAFF_USE_CASE = 'createStaffUsecaseProxy';
  static UPDATE_STAFF_USE_CASE = 'updateStaffUsecaseProxy';
  static REMOVE_STAFF_USE_CASE = 'removeStaffUsecaseProxy';
  static LIST_APPOINTMENTS_USE_CASE = 'listAppointmentsUsecaseProxy';
  static GET_APPOINTMENT_BY_ID_USE_CASE = 'getAppointmentByIdUsecaseProxy';
  static CREATE_APPOINTMENT_USE_CASE = 'createAppointmentUsecaseProxy';
  static UPDATE_APPOINTMENT_USE_CASE = 'updateAppointmentUsecaseProxy';
  static REMOVE_APPOINTMENT_USE_CASE = 'removeAppointmentUsecaseProxy';
  static GET_APPOINTMENT_BY_CLIENTID_USE_CASE = 'getAppointmentByClientIdUsecaseProxy';

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
        {
          inject: [TenantRepositoryPostgres, PostgresService],
          provide: UsecaseProxyModule.CREATE_TENANT_USE_CASE,
          useFactory: (
            tenantRepository: TenantRepositoryPostgres,
            postgres: PostgresService,
          ) =>
            new UseCaseProxy(
              new CreateTenantUseCase(tenantRepository, postgres),
            ),
        },
        {
          inject: [TenantRepositoryPostgres],
          provide: UsecaseProxyModule.GET_TENANT_BY_ID_USE_CASE,
          useFactory: (tenantRepository: TenantRepositoryPostgres) =>
            new UseCaseProxy(new GetTenantByIdUseCase(tenantRepository)),
        },
        // --- SERVICES ---
        {
          inject: [ServiceRepositoryPostgres],
          provide: UsecaseProxyModule.LIST_SERVICES_USE_CASE,
          useFactory: (serviceRepository: ServiceRepositoryPostgres) =>
            new UseCaseProxy(new ListServicesUseCase(serviceRepository)),
        },
        {
          inject: [ServiceRepositoryPostgres],
          provide: UsecaseProxyModule.GET_SERVICE_BY_ID_USE_CASE,
          useFactory: (serviceRepository: ServiceRepositoryPostgres) =>
            new UseCaseProxy(new GetServiceByIdUseCase(serviceRepository)),
        },
        {
          inject: [ServiceRepositoryPostgres],
          provide: UsecaseProxyModule.CREATE_SERVICE_USE_CASE,
          useFactory: (serviceRepository: ServiceRepositoryPostgres) =>
            new UseCaseProxy(new CreateServiceUseCase(serviceRepository)),
        },
        {
          inject: [ServiceRepositoryPostgres],
          provide: UsecaseProxyModule.UPDATE_SERVICE_USE_CASE,
          useFactory: (serviceRepository: ServiceRepositoryPostgres) =>
            new UseCaseProxy(new UpdateServiceUseCase(serviceRepository)),
        },
        {
          inject: [ServiceRepositoryPostgres],
          provide: UsecaseProxyModule.REMOVE_SERVICE_USE_CASE,
          useFactory: (serviceRepository: ServiceRepositoryPostgres) =>
            new UseCaseProxy(new RemoveServiceUseCase(serviceRepository)),
        },
        // --- CLIENTS ---
        {
          inject: [ClientRepositoryPostgres],
          provide: UsecaseProxyModule.LIST_CLIENTS_USE_CASE,
          useFactory: (clientRepository: ClientRepositoryPostgres) =>
            new UseCaseProxy(new ListClientsUseCase(clientRepository)),
        },
        {
          inject: [ClientRepositoryPostgres],
          provide: UsecaseProxyModule.GET_CLIENT_BY_ID_USE_CASE,
          useFactory: (clientRepository: ClientRepositoryPostgres) =>
            new UseCaseProxy(new GetClientByIdUseCase(clientRepository)),
        },
        {
          inject: [ClientRepositoryPostgres],
          provide: UsecaseProxyModule.CREATE_CLIENT_USE_CASE,
          useFactory: (clientRepository: ClientRepositoryPostgres) =>
            new UseCaseProxy(new CreateClientUseCase(clientRepository)),
        },
        {
          inject: [ClientRepositoryPostgres],
          provide: UsecaseProxyModule.UPDATE_CLIENT_USE_CASE,
          useFactory: (clientRepository: ClientRepositoryPostgres) =>
            new UseCaseProxy(new UpdateClientUseCase(clientRepository)),
        },
        {
          inject: [ClientRepositoryPostgres],
          provide: UsecaseProxyModule.REMOVE_CLIENT_USE_CASE,
          useFactory: (clientRepository: ClientRepositoryPostgres) =>
            new UseCaseProxy(new RemoveClientUseCase(clientRepository)),
        },
        // --- STAFF ---
        {
          inject: [StaffRepositoryPostgres],
          provide: UsecaseProxyModule.LIST_STAFF_USE_CASE,
          useFactory: (staffRepository: StaffRepositoryPostgres) =>
            new UseCaseProxy(new ListStaffUseCase(staffRepository)),
        },
        {
          inject: [StaffRepositoryPostgres],
          provide: UsecaseProxyModule.GET_STAFF_BY_ID_USE_CASE,
          useFactory: (staffRepository: StaffRepositoryPostgres) =>
            new UseCaseProxy(new GetStaffByIdUseCase(staffRepository)),
        },
        {
          inject: [StaffRepositoryPostgres],
          provide: UsecaseProxyModule.CREATE_STAFF_USE_CASE,
          useFactory: (staffRepository: StaffRepositoryPostgres) =>
            new UseCaseProxy(new CreateStaffUseCase(staffRepository)),
        },
        {
          inject: [StaffRepositoryPostgres],
          provide: UsecaseProxyModule.UPDATE_STAFF_USE_CASE,
          useFactory: (staffRepository: StaffRepositoryPostgres) =>
            new UseCaseProxy(new UpdateStaffUseCase(staffRepository)),
        },
        {
          inject: [StaffRepositoryPostgres],
          provide: UsecaseProxyModule.REMOVE_STAFF_USE_CASE,
          useFactory: (staffRepository: StaffRepositoryPostgres) =>
            new UseCaseProxy(new RemoveStaffUseCase(staffRepository)),
        },
        // --- APPOINTMENTS ---
        {
          inject: [AppointmentRepositoryPostgres],
          provide: UsecaseProxyModule.LIST_APPOINTMENTS_USE_CASE,
          useFactory: (appointmentRepository: AppointmentRepositoryPostgres) =>
            new UseCaseProxy(
              new ListAppointmentsUseCase(appointmentRepository),
            ),
        },
        {
          inject: [AppointmentRepositoryPostgres],
          provide: UsecaseProxyModule.GET_APPOINTMENT_BY_ID_USE_CASE,
          useFactory: (appointmentRepository: AppointmentRepositoryPostgres) =>
            new UseCaseProxy(
              new GetAppointmentByIdUseCase(appointmentRepository),
            ),
        },
        {
          inject: [AppointmentRepositoryPostgres],
          provide: UsecaseProxyModule.CREATE_APPOINTMENT_USE_CASE,
          useFactory: (appointmentRepository: AppointmentRepositoryPostgres) =>
            new UseCaseProxy(
              new CreateAppointmentUseCase(appointmentRepository),
            ),
        },
        {
          inject: [AppointmentRepositoryPostgres],
          provide: UsecaseProxyModule.UPDATE_APPOINTMENT_USE_CASE,
          useFactory: (appointmentRepository: AppointmentRepositoryPostgres) =>
            new UseCaseProxy(
              new UpdateAppointmentUseCase(appointmentRepository),
            ),
        },
        {
          inject: [AppointmentRepositoryPostgres],
          provide: UsecaseProxyModule.REMOVE_APPOINTMENT_USE_CASE,
          useFactory: (appointmentRepository: AppointmentRepositoryPostgres) =>
            new UseCaseProxy(
              new RemoveAppointmentUseCase(appointmentRepository),
            ),
        },
        {
          inject: [AppointmentRepositoryPostgres],
          provide: UsecaseProxyModule.GET_APPOINTMENT_BY_CLIENTID_USE_CASE,
          useFactory: (appointmentRepository: AppointmentRepositoryPostgres) =>
            new UseCaseProxy(
              new GetAppointmentByClientIdUseCase(appointmentRepository),
            ),
        },
      ],
      exports: [
        UsecaseProxyModule.CREATE_TENANT_USE_CASE,
        UsecaseProxyModule.LIST_TENANTS_USE_CASE,
        UsecaseProxyModule.GET_TENANT_BY_ID_USE_CASE,
        UsecaseProxyModule.LIST_SERVICES_USE_CASE,
        UsecaseProxyModule.GET_SERVICE_BY_ID_USE_CASE,
        UsecaseProxyModule.CREATE_SERVICE_USE_CASE,
        UsecaseProxyModule.UPDATE_SERVICE_USE_CASE,
        UsecaseProxyModule.REMOVE_SERVICE_USE_CASE,
        UsecaseProxyModule.LIST_CLIENTS_USE_CASE,
        UsecaseProxyModule.GET_CLIENT_BY_ID_USE_CASE,
        UsecaseProxyModule.CREATE_CLIENT_USE_CASE,
        UsecaseProxyModule.UPDATE_CLIENT_USE_CASE,
        UsecaseProxyModule.REMOVE_CLIENT_USE_CASE,
        UsecaseProxyModule.LIST_STAFF_USE_CASE,
        UsecaseProxyModule.GET_STAFF_BY_ID_USE_CASE,
        UsecaseProxyModule.CREATE_STAFF_USE_CASE,
        UsecaseProxyModule.UPDATE_STAFF_USE_CASE,
        UsecaseProxyModule.REMOVE_STAFF_USE_CASE,
        UsecaseProxyModule.LIST_APPOINTMENTS_USE_CASE,
        UsecaseProxyModule.GET_APPOINTMENT_BY_ID_USE_CASE,
        UsecaseProxyModule.CREATE_APPOINTMENT_USE_CASE,
        UsecaseProxyModule.UPDATE_APPOINTMENT_USE_CASE,
        UsecaseProxyModule.REMOVE_APPOINTMENT_USE_CASE,
        UsecaseProxyModule.GET_APPOINTMENT_BY_CLIENTID_USE_CASE,
      ],
    };
  }
}
