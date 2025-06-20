import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { CreatePlanDto, UpdatePlanDto } from '../../dtos/plan.dto';
import { PlanUsecaseProxyModule } from '../../../application/usecases/Plans/plan-usecase-proxy.module';
import { UseCaseProxy } from '../../../application/usecases/usecase-proxy';
import { ListPlansUseCase } from '../../../application/usecases/Plans/plan-useCase-list';
import { GetPlanByIdUseCase } from '../../../application/usecases/Plans/plan-useCase-getById';
import { CreatePlanUseCase } from '../../../application/usecases/Plans/plan-useCase-create';
import { UpdatePlanUseCase } from '../../../application/usecases/Plans/plan-useCase-update';
import { RemovePlanUseCase } from '../../../application/usecases/Plans/plan-useCase-remove';

@Controller('admin/plans')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class PlanController {
  constructor(
    @Inject(PlanUsecaseProxyModule.LIST_PLANS_USE_CASE)
    private readonly listPlansUseCaseProxy: UseCaseProxy<ListPlansUseCase>,
    @Inject(PlanUsecaseProxyModule.GET_PLAN_BY_ID_USE_CASE)
    private readonly getPlanByIdUseCaseProxy: UseCaseProxy<GetPlanByIdUseCase>,
    @Inject(PlanUsecaseProxyModule.CREATE_PLAN_USE_CASE)
    private readonly createPlanUseCaseProxy: UseCaseProxy<CreatePlanUseCase>,
    @Inject(PlanUsecaseProxyModule.UPDATE_PLAN_USE_CASE)
    private readonly updatePlanUseCaseProxy: UseCaseProxy<UpdatePlanUseCase>,
    @Inject(PlanUsecaseProxyModule.REMOVE_PLAN_USE_CASE)
    private readonly removePlanUseCaseProxy: UseCaseProxy<RemovePlanUseCase>,
  ) {}

  @Get()
  async findAll() {
    return await this.listPlansUseCaseProxy.getInstance().execute();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.getPlanByIdUseCaseProxy.getInstance().execute(id);
  }

  @Post()
  async create(@Body() data: CreatePlanDto) {
    return await this.createPlanUseCaseProxy.getInstance().execute(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdatePlanDto) {
    return await this.updatePlanUseCaseProxy
      .getInstance()
      .execute({ id, plan: data });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.removePlanUseCaseProxy.getInstance().execute(id);
    return { success: true };
  }
}
