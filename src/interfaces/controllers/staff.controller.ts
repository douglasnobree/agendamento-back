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
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../infra/auth/jwt-auth.guard';
import { RolesGuard } from '../../infra/auth/roles.guard';
import { Roles } from '../../infra/decorators/roles.decorator';
import { UsecaseProxyModule } from '../../application/usecases/usecase-proxy.module';
import { UseCaseProxy } from '../../application/usecases/usecase-proxy';
import { ListStaffUseCase } from '../../application/usecases/Staff/staff-useCase-list';
import { GetStaffByIdUseCase } from '../../application/usecases/Staff/staff-useCase-getById';
import { CreateStaffUseCase } from '../../application/usecases/Staff/staff-useCase-create';
import { UpdateStaffUseCase } from '../../application/usecases/Staff/staff-useCase-update';
import { RemoveStaffUseCase } from '../../application/usecases/Staff/staff-useCase-remove';
import { CreateStaffDto, UpdateStaffDto } from '../dtos/staff.dto';
import { ApiBearerAuth, ApiHeader } from '@nestjs/swagger';

@Controller('api/tenant/staff')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('owner', 'admin')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-tenant-id',
  description: 'Identificador do tenant',
  required: true,
  schema: { type: 'string' },
})
export class StaffController {
  constructor(
    @Inject(UsecaseProxyModule.LIST_STAFF_USE_CASE)
    private readonly listStaffUseCaseProxy: UseCaseProxy<ListStaffUseCase>,
    @Inject(UsecaseProxyModule.GET_STAFF_BY_ID_USE_CASE)
    private readonly getStaffByIdUseCaseProxy: UseCaseProxy<GetStaffByIdUseCase>,
    @Inject(UsecaseProxyModule.CREATE_STAFF_USE_CASE)
    private readonly createStaffUseCaseProxy: UseCaseProxy<CreateStaffUseCase>,
    @Inject(UsecaseProxyModule.UPDATE_STAFF_USE_CASE)
    private readonly updateStaffUseCaseProxy: UseCaseProxy<UpdateStaffUseCase>,
    @Inject(UsecaseProxyModule.REMOVE_STAFF_USE_CASE)
    private readonly removeStaffUseCaseProxy: UseCaseProxy<RemoveStaffUseCase>,
  ) {}

  @Get()
  async findAll(@Req() req: Request) {
    const tenantSchema = (req as any).tenantSchema;
    return this.listStaffUseCaseProxy.getInstance().execute(tenantSchema);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const tenantSchema = (req as any).tenantSchema;
    return this.getStaffByIdUseCaseProxy
      .getInstance()
      .execute(tenantSchema, id);
  }

  @Post()
  async create(@Req() req: Request, @Body() data: CreateStaffDto) {
    const tenantSchema = (req as any).tenantSchema;
    return this.createStaffUseCaseProxy
      .getInstance()
      .execute(tenantSchema, data);
  }

  @Put(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() data: UpdateStaffDto,
  ) {
    const tenantSchema = (req as any).tenantSchema;
    return this.updateStaffUseCaseProxy
      .getInstance()
      .execute(tenantSchema, { id, ...data });
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const tenantSchema = (req as any).tenantSchema;
    await this.removeStaffUseCaseProxy.getInstance().execute(tenantSchema, id);
    return { success: true };
  }
}
