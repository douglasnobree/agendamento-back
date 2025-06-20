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
import {
  ApiBearerAuth,
  ApiHeader,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { GetAppointmentByClientIdUseCase } from 'src/application/usecases/Appointments/appointment-useCase-getByClientId';

@ApiTags('appointments')
@Controller('api/tenant/appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiHeader({
  name: 'x-tenant-id',
  description: 'Identificador único do tenant (empresa/estabelecimento)',
  required: true,
  schema: { type: 'string', example: 'empresa-abc123' },
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
  @ApiOperation({
    summary: 'Listar todos os agendamentos',
    description:
      'Retorna todos os agendamentos registrados no sistema para o tenant atual.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de agendamentos',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: '550e8400-e29b-41d4-a716-446655440000',
          },
          clientId: {
            type: 'string',
            example: '550e8400-e29b-41d4-a716-446655440001',
          },
          serviceId: {
            type: 'string',
            example: '550e8400-e29b-41d4-a716-446655440002',
          },
          staffId: {
            type: 'string',
            example: '550e8400-e29b-41d4-a716-446655440003',
          },
          scheduledAt: { type: 'string', example: '2025-06-19T10:00:00.000Z' },
          status: { type: 'string', example: 'confirmed' },
          createdAt: { type: 'string', example: '2025-06-19T09:30:00.000Z' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - Permissões insuficientes',
  })
  async findAll(@Req() req: Request) {
    const tenantSchema = (req as any).tenantSchema;
    return this.listAppointmentsUseCaseProxy
      .getInstance()
      .execute({ schema: tenantSchema });
  }

  @Get('client/:clientId')
  @Roles('owner', 'admin', 'client')
  @ApiOperation({
    summary: 'Listar agendamentos de um cliente',
    description: 'Retorna todos os agendamentos de um cliente específico.',
  })
  @ApiParam({
    name: 'clientId',
    description: 'ID único do cliente',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de agendamentos do cliente',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: '550e8400-e29b-41d4-a716-446655440000',
          },
          clientId: {
            type: 'string',
            example: '550e8400-e29b-41d4-a716-446655440001',
          },
          serviceId: {
            type: 'string',
            example: '550e8400-e29b-41d4-a716-446655440002',
          },
          staffId: {
            type: 'string',
            example: '550e8400-e29b-41d4-a716-446655440003',
          },
          scheduledAt: { type: 'string', example: '2025-06-19T10:00:00.000Z' },
          status: { type: 'string', example: 'confirmed' },
          createdAt: { type: 'string', example: '2025-06-19T09:30:00.000Z' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - Permissões insuficientes',
  })
  async findByClient(@Req() req: Request, @Param('clientId') clientId: string) {
    const tenantSchema = (req as any).tenantSchema;
    return await this.getAppointmentByClientIdUseCaseProxy
      .getInstance()
      .execute(tenantSchema, clientId);
  }

  @Get(':appointmentId')
  @Roles('owner', 'admin', 'client')
  @ApiOperation({
    summary: 'Obter um agendamento específico',
    description:
      'Retorna os detalhes de um agendamento específico pelo seu ID.',
  })
  @ApiParam({
    name: 'appointmentId',
    description: 'ID único do agendamento',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Detalhes do agendamento',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
        clientId: {
          type: 'string',
          example: '550e8400-e29b-41d4-a716-446655440001',
        },
        serviceId: {
          type: 'string',
          example: '550e8400-e29b-41d4-a716-446655440002',
        },
        staffId: {
          type: 'string',
          example: '550e8400-e29b-41d4-a716-446655440003',
        },
        scheduledAt: { type: 'string', example: '2025-06-19T10:00:00.000Z' },
        status: { type: 'string', example: 'confirmed' },
        createdAt: { type: 'string', example: '2025-06-19T09:30:00.000Z' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - Permissões insuficientes',
  })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  async findOne(@Req() req: Request, @Param('appointmentId') id: string) {
    const tenantSchema = (req as any).tenantSchema;
    return this.getAppointmentByIdUseCaseProxy.getInstance().execute({
      schema: tenantSchema,
      id,
    });
  }

  @Post()
  @Roles('owner', 'admin', 'client')
  @ApiOperation({
    summary: 'Criar um novo agendamento',
    description:
      'Cria um novo agendamento verificando disponibilidade do horário com base nos slots disponíveis do funcionário.',
  })
  @ApiBody({
    type: CreateAppointmentDto,
    description: 'Dados para criação do agendamento',
  })
  @ApiResponse({
    status: 201,
    description: 'Agendamento criado com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
        clientId: {
          type: 'string',
          example: '550e8400-e29b-41d4-a716-446655440001',
        },
        serviceId: {
          type: 'string',
          example: '550e8400-e29b-41d4-a716-446655440002',
        },
        staffId: {
          type: 'string',
          example: '550e8400-e29b-41d4-a716-446655440003',
        },
        scheduledAt: { type: 'string', example: '2025-06-19T10:00:00.000Z' },
        status: { type: 'string', example: 'pending' },
        createdAt: { type: 'string', example: '2025-06-19T09:30:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Requisição inválida - Parâmetros incorretos ou ausentes',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - Permissões insuficientes',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflito - Horário não disponível para agendamento',
  })
  async create(@Req() req: Request, @Body() data: CreateAppointmentDto) {
    const tenantSchema = (req as any).tenantSchema;

    // Converter para o formato esperado pelo use case
    const inputDto = {
      clientId: data.clientId,
      serviceId: data.serviceId,
      staffId: data.staffId,
      scheduledDate: data.scheduledDate,
      scheduledTime: data.scheduledTime,
      status: data.status,
    };

    return this.createAppointmentUseCaseProxy.getInstance().execute({
      schema: tenantSchema,
      data: inputDto,
    });
  }

  @Put(':id')
  @Roles('owner', 'admin', 'client')
  @ApiOperation({
    summary: 'Atualizar um agendamento',
    description:
      'Atualiza os dados de um agendamento existente, verificando disponibilidade caso horário ou funcionário sejam alterados.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do agendamento',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @ApiBody({
    type: UpdateAppointmentDto,
    description: 'Dados para atualização do agendamento',
  })
  @ApiResponse({
    status: 200,
    description: 'Agendamento atualizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
        clientId: {
          type: 'string',
          example: '550e8400-e29b-41d4-a716-446655440001',
        },
        serviceId: {
          type: 'string',
          example: '550e8400-e29b-41d4-a716-446655440002',
        },
        staffId: {
          type: 'string',
          example: '550e8400-e29b-41d4-a716-446655440003',
        },
        scheduledAt: { type: 'string', example: '2025-06-19T14:00:00.000Z' },
        status: { type: 'string', example: 'confirmed' },
        createdAt: { type: 'string', example: '2025-06-19T09:30:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Requisição inválida - Parâmetros incorretos',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - Permissões insuficientes',
  })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Conflito - Novo horário não disponível para agendamento',
  })
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() data: UpdateAppointmentDto,
  ) {
    const tenantSchema = (req as any).tenantSchema;

    // Converter para o formato esperado pelo use case
    const inputDto: any = { id };

    if (data.clientId) inputDto.clientId = data.clientId;
    if (data.serviceId) inputDto.serviceId = data.serviceId;
    if (data.staffId) inputDto.staffId = data.staffId;
    if (data.status) inputDto.status = data.status;

    // Adicionar dados de data/hora se fornecidos
    if (data.scheduledDate) inputDto.scheduledDate = data.scheduledDate;
    if (data.scheduledTime) inputDto.scheduledTime = data.scheduledTime;

    return this.updateAppointmentUseCaseProxy.getInstance().execute({
      schema: tenantSchema,
      data: inputDto,
    });
  }

  @Delete(':id')
  @Roles('owner', 'admin')
  @ApiOperation({
    summary: 'Excluir um agendamento',
    description: 'Remove um agendamento existente do sistema.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do agendamento',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Agendamento excluído com sucesso',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - Permissões insuficientes',
  })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  async remove(@Req() req: Request, @Param('id') id: string) {
    const tenantSchema = (req as any).tenantSchema;
    await this.removeAppointmentUseCaseProxy.getInstance().execute({
      schema: tenantSchema,
      id,
    });
    return { success: true };
  }
}
