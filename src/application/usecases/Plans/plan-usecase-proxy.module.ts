import { DynamicModule, Module } from '@nestjs/common';
import { PlanRepositoryPostgres } from '../../../infra/db/postgres/repositories/plan.repository';
import { ListPlansUseCase } from './plan-useCase-list';
import { GetPlanByIdUseCase } from './plan-useCase-getById';
import { CreatePlanUseCase } from './plan-useCase-create';
import { UpdatePlanUseCase } from './plan-useCase-update';
import { RemovePlanUseCase } from './plan-useCase-remove';
import { UseCaseProxy } from '../usecase-proxy';
import { PostgresModule } from '../../../infra/db/postgres/postgres.module';

@Module({
  imports: [PostgresModule],
})
export class PlanUsecaseProxyModule {
  static LIST_PLANS_USE_CASE = 'listPlansUsecaseProxy';
  static GET_PLAN_BY_ID_USE_CASE = 'getPlanByIdUsecaseProxy';
  static CREATE_PLAN_USE_CASE = 'createPlanUsecaseProxy';
  static UPDATE_PLAN_USE_CASE = 'updatePlanUsecaseProxy';
  static REMOVE_PLAN_USE_CASE = 'removePlanUsecaseProxy';

  static register(): DynamicModule {
    return {
      module: PlanUsecaseProxyModule,
      providers: [
        {
          inject: [PlanRepositoryPostgres],
          provide: PlanUsecaseProxyModule.LIST_PLANS_USE_CASE,
          useFactory: (repo: PlanRepositoryPostgres) =>
            new UseCaseProxy(new ListPlansUseCase(repo)),
        },
        {
          inject: [PlanRepositoryPostgres],
          provide: PlanUsecaseProxyModule.GET_PLAN_BY_ID_USE_CASE,
          useFactory: (repo: PlanRepositoryPostgres) =>
            new UseCaseProxy(new GetPlanByIdUseCase(repo)),
        },
        {
          inject: [PlanRepositoryPostgres],
          provide: PlanUsecaseProxyModule.CREATE_PLAN_USE_CASE,
          useFactory: (repo: PlanRepositoryPostgres) =>
            new UseCaseProxy(new CreatePlanUseCase(repo)),
        },
        {
          inject: [PlanRepositoryPostgres],
          provide: PlanUsecaseProxyModule.UPDATE_PLAN_USE_CASE,
          useFactory: (repo: PlanRepositoryPostgres) =>
            new UseCaseProxy(new UpdatePlanUseCase(repo)),
        },
        {
          inject: [PlanRepositoryPostgres],
          provide: PlanUsecaseProxyModule.REMOVE_PLAN_USE_CASE,
          useFactory: (repo: PlanRepositoryPostgres) =>
            new UseCaseProxy(new RemovePlanUseCase(repo)),
        },
      ],
      exports: [
        PlanUsecaseProxyModule.LIST_PLANS_USE_CASE,
        PlanUsecaseProxyModule.GET_PLAN_BY_ID_USE_CASE,
        PlanUsecaseProxyModule.CREATE_PLAN_USE_CASE,
        PlanUsecaseProxyModule.UPDATE_PLAN_USE_CASE,
        PlanUsecaseProxyModule.REMOVE_PLAN_USE_CASE,
      ],
    };
  }
}
