import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Query,
  Inject,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../infra/auth/jwt-auth.guard';
import { RolesGuard } from '../../infra/auth/roles.guard';
import { Roles } from '../../infra/decorators/roles.decorator';
import { AppointmentUsecaseProxyModule } from '../../application/usecases/Appointments/appointment-usecase-proxy.module';
import { UseCaseProxy } from '../../application/usecases/usecase-proxy';
import { ListAppointmentsUseCase } from '../../application/usecases/Appointments/appointment-useCase-list';
import { GetAppointmentByIdUseCase } from '../../application/usecases/Appointments/appointment-useCase-getById';
import { CreateAppointmentUseCase } from '../../application/usecases/Appointments/appointment-useCase-create';
import { UpdateAppointmentUseCase } from '../../application/usecases/Appointments/appointment-useCase-update';
import { RemoveAppointmentUseCase } from '../../application/usecases/Appointments/appointment-useCase-remove';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
} from '../dtos/appointment.dto';
import { ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { GetAppointmentByClientIdUseCase } from 'src/application/usecases/Appointments/appointment-useCase-getByClientId';

@Controller('api/tenant/appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiHeader({
  name: 'x-tenant-id',
  description: 'Identificador do tenant',
  required: true,
  schema: { type: 'string' },
})
export class AppointmentController {
  constructor(
    @Inject(AppointmentUsecaseProxyModule.LIST_APPOINTMENTS_USE_CASE)
    private readonly listAppointmentsUseCaseProxy: UseCaseProxy<ListAppointmentsUseCase>,
    @Inject(AppointmentUsecaseProxyModule.GET_APPOINTMENT_BY_ID_USE_CASE)
    private readonly getAppointmentByIdUseCaseProxy: UseCaseProxy<GetAppointmentByIdUseCase>,
    @Inject(AppointmentUsecaseProxyModule.CREATE_APPOINTMENT_USE_CASE)
    private readonly createAppointmentUseCaseProxy: UseCaseProxy<CreateAppointmentUseCase>,
    @Inject(AppointmentUsecaseProxyModule.UPDATE_APPOINTMENT_USE_CASE)
    private readonly updateAppointmentUseCaseProxy: UseCaseProxy<UpdateAppointmentUseCase>,
    @Inject(AppointmentUsecaseProxyModule.REMOVE_APPOINTMENT_USE_CASE)
    private readonly removeAppointmentUseCaseProxy: UseCaseProxy<RemoveAppointmentUseCase>,
    @Inject(AppointmentUsecaseProxyModule.GET_APPOINTMENT_BY_CLIENTID_USE_CASE)
    private readonly getAppointmentByClientIdUseCaseProxy: UseCaseProxy<GetAppointmentByClientIdUseCase>,
  ) {}

  @Get()
  @Roles('owner', 'admin')
  async findAll(@Req() req: Request) {
    const tenantSchema = (req as any).tenantSchema;
    console.log('tenantSchema', tenantSchema);
    return this.listAppointmentsUseCaseProxy
      .getInstance()
      .execute({ schema: tenantSchema });
  }

  @Get('client/:clientId')
  @Roles('owner', 'admin', 'client')
  async findByClient(@Req() req: Request, @Param('clientId') clientId: string) {
    const tenantSchema = (req as any).tenantSchema;

    const all = await this.listAppointmentsUseCaseProxy
      .getInstance()
      .execute({ schema: tenantSchema });
    return all.filter((a) => a.clientId === clientId);
  }

  @Get(':appointmentId')
  @Roles('owner', 'admin', 'client')
  async findOne(@Req() req: Request, @Param('appointmentId') id: string) {
    const tenantSchema = (req as any).tenantSchema;
    return this.getAppointmentByIdUseCaseProxy.getInstance().execute({
      schema: tenantSchema,
      id,
    });
  }

  @Post()
  @Roles('owner', 'admin', 'client')
  async create(@Req() req: Request, @Body() data: CreateAppointmentDto) {
    const tenantSchema = (req as any).tenantSchema;
    return this.createAppointmentUseCaseProxy.getInstance().execute({
      schema: tenantSchema,
      data,
    });
  }

  @Put(':id')
  @Roles('owner', 'admin', 'client')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() data: UpdateAppointmentDto,
  ) {
    const tenantSchema = (req as any).tenantSchema;
    return this.updateAppointmentUseCaseProxy.getInstance().execute({
      schema: tenantSchema,
      data: { id, ...data },
    });
  }

  @Delete(':id')
  @Roles('owner', 'admin')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const tenantSchema = (req as any).tenantSchema;
    await this.removeAppointmentUseCaseProxy.getInstance().execute({
      schema: tenantSchema,
      id,
    });
    return { success: true };
  }
}
