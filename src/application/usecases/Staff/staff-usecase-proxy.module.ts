import { DynamicModule, Module } from '@nestjs/common';
import { StaffRepositoryPostgres } from '../../../infra/db/postgres/repositories/staff.repository';
import { ListStaffUseCase } from './staff-useCase-list';
import { GetStaffByIdUseCase } from './staff-useCase-getById';
import { CreateStaffUseCase } from './staff-useCase-create';
import { UpdateStaffUseCase } from './staff-useCase-update';
import { RemoveStaffUseCase } from './staff-useCase-remove';
import { UseCaseProxy } from '../usecase-proxy';
import { PostgresModule } from '../../../infra/db/postgres/postgres.module';

@Module({
  imports: [PostgresModule],
})
export class StaffUsecaseProxyModule {
  static LIST_STAFF_USE_CASE = 'listStaffUsecaseProxy';
  static GET_STAFF_BY_ID_USE_CASE = 'getStaffByIdUsecaseProxy';
  static CREATE_STAFF_USE_CASE = 'createStaffUsecaseProxy';
  static UPDATE_STAFF_USE_CASE = 'updateStaffUsecaseProxy';
  static REMOVE_STAFF_USE_CASE = 'removeStaffUsecaseProxy';

  static register(): DynamicModule {
    return {
      module: StaffUsecaseProxyModule,
      providers: [
        {
          inject: [StaffRepositoryPostgres],
          provide: StaffUsecaseProxyModule.LIST_STAFF_USE_CASE,
          useFactory: (repo: StaffRepositoryPostgres) =>
            new UseCaseProxy(new ListStaffUseCase(repo)),
        },
        {
          inject: [StaffRepositoryPostgres],
          provide: StaffUsecaseProxyModule.GET_STAFF_BY_ID_USE_CASE,
          useFactory: (repo: StaffRepositoryPostgres) =>
            new UseCaseProxy(new GetStaffByIdUseCase(repo)),
        },
        {
          inject: [StaffRepositoryPostgres],
          provide: StaffUsecaseProxyModule.CREATE_STAFF_USE_CASE,
          useFactory: (repo: StaffRepositoryPostgres) =>
            new UseCaseProxy(new CreateStaffUseCase(repo)),
        },
        {
          inject: [StaffRepositoryPostgres],
          provide: StaffUsecaseProxyModule.UPDATE_STAFF_USE_CASE,
          useFactory: (repo: StaffRepositoryPostgres) =>
            new UseCaseProxy(new UpdateStaffUseCase(repo)),
        },
        {
          inject: [StaffRepositoryPostgres],
          provide: StaffUsecaseProxyModule.REMOVE_STAFF_USE_CASE,
          useFactory: (repo: StaffRepositoryPostgres) =>
            new UseCaseProxy(new RemoveStaffUseCase(repo)),
        },
      ],
      exports: [
        StaffUsecaseProxyModule.LIST_STAFF_USE_CASE,
        StaffUsecaseProxyModule.GET_STAFF_BY_ID_USE_CASE,
        StaffUsecaseProxyModule.CREATE_STAFF_USE_CASE,
        StaffUsecaseProxyModule.UPDATE_STAFF_USE_CASE,
        StaffUsecaseProxyModule.REMOVE_STAFF_USE_CASE,
      ],
    };
  }
}
