import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Inject,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UseCaseProxy } from '../../application/usecases/usecase-proxy';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  getSchemaPath,
} from '@nestjs/swagger';
import { AvailableSlotUsecaseProxyModule } from '../../application/usecases/AvailableSlots/available-slot-usecase-proxy.module';
import { CreateAvailableSlotUseCase } from '../../application/usecases/AvailableSlots/available-slot-useCase-create';
import { GetAvailableSlotByStaffIdUseCase } from '../../application/usecases/AvailableSlots/available-slot-useCase-getByStaffId';
import { GetAvailableTimeslotsUseCase } from '../../application/usecases/AvailableSlots/available-slot-useCase-getAvailableTimeslots';
import {
  CreateAvailableSlotDto,
  GetAvailableTimeslotsDto,
  AvailableTimeslotsResponseDto,
} from '../dtos/available-slot.dto';
import {
  CreateAvailableSlotInputDto,
  GetAvailableTimeslotsInputDto,
} from '../../application/dtos/AvailableSlots/available-slot.dto';

@ApiTags('available-slots')
@Controller('api/tenant/available-slots')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiHeader({
  name: 'x-tenant-id',
  description: 'Identificador único do tenant (empresa/estabelecimento)',
  required: true,
  schema: { type: 'string', example: 'empresa-abc123' },
})
export class AvailableSlotController {
  constructor(
    @Inject(AvailableSlotUsecaseProxyModule.CREATE_AVAILABLE_SLOT_USE_CASE)
    private readonly createAvailableSlotUseCaseProxy: UseCaseProxy<CreateAvailableSlotUseCase>,
    @Inject(
      AvailableSlotUsecaseProxyModule.GET_AVAILABLE_SLOTS_BY_STAFF_ID_USE_CASE,
    )
    private readonly getAvailableSlotByStaffIdUseCaseProxy: UseCaseProxy<GetAvailableSlotByStaffIdUseCase>,
    @Inject(AvailableSlotUsecaseProxyModule.GET_AVAILABLE_TIMESLOTS_USE_CASE)
    private readonly getAvailableTimeslotsUseCaseProxy: UseCaseProxy<GetAvailableTimeslotsUseCase>,
  ) {}
  @Post()
  @Roles('owner', 'admin')
  @ApiOperation({
    summary: 'Criar um novo horário disponível',
    description:
      'Cria um novo horário em que o funcionário estará disponível para agendamentos. Pode ser um horário recorrente (semanal) ou específico para uma data.',
  })
  @ApiResponse({
    status: 201,
    description: 'Horário disponível criado com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
        staffId: {
          type: 'string',
          example: '550e8400-e29b-41d4-a716-446655440001',
        },
        dayOfWeek: {
          type: 'number',
          example: 1,
          description: '0 = domingo, 1 = segunda, ..., 6 = sábado',
        },
        startTime: { type: 'string', example: '2025-06-19T09:00:00.000Z' },
        endTime: { type: 'string', example: '2025-06-19T17:00:00.000Z' },
        isRecurring: { type: 'boolean', example: true },
        specificDate: { type: 'string', example: null },
        createdAt: { type: 'string', example: '2025-06-19T15:30:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Parâmetros inválidos na requisição',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - Permissões insuficientes',
  })
  async create(@Body() createDto: CreateAvailableSlotDto, @Req() req) {
    const schema = req.tenantSchema;

    // Converter os horários de string para Date
    const inputDto = new CreateAvailableSlotInputDto();
    inputDto.staffId = createDto.staffId;
    inputDto.dayOfWeek = createDto.dayOfWeek;

    // Parse de string ISO para Date (formato ISO: HH:MM)
    const [startHours, startMinutes] = createDto.startTime
      .split(':')
      .map(Number);
    const [endHours, endMinutes] = createDto.endTime.split(':').map(Number);

    const startTime = new Date();
    startTime.setHours(startHours, startMinutes, 0, 0);

    const endTime = new Date();
    endTime.setHours(endHours, endMinutes, 0, 0);

    inputDto.startTime = startTime;
    inputDto.endTime = endTime;

    // Configurar campos opcionais
    inputDto.isRecurring =
      createDto.isRecurring !== undefined ? createDto.isRecurring : true;
    if (createDto.specificDate && !inputDto.isRecurring) {
      inputDto.specificDate = new Date(createDto.specificDate);
    }

    const availableSlot = await this.createAvailableSlotUseCaseProxy
      .getInstance()
      .execute({
        schema,
        data: inputDto,
      });

    return {
      id: availableSlot.id,
      staffId: availableSlot.staffId,
      dayOfWeek: availableSlot.dayOfWeek,
      startTime: availableSlot.startTime.toISOString(),
      endTime: availableSlot.endTime.toISOString(),
      isRecurring: availableSlot.isRecurring,
      specificDate: availableSlot.specificDate?.toISOString(),
      createdAt: availableSlot.createdAt?.toISOString(),
    };
  }
  @Get('staff/:staffId')
  @Roles('owner', 'admin', 'staff')
  @ApiOperation({
    summary: 'Obter todos os horários disponíveis de um funcionário',
    description:
      'Retorna todos os horários disponíveis cadastrados para um funcionário específico, incluindo os recorrentes e os específicos para datas.',
  })
  @ApiParam({
    name: 'staffId',
    description: 'ID único do funcionário',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de horários disponíveis',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: '550e8400-e29b-41d4-a716-446655440000',
          },
          staffId: {
            type: 'string',
            example: '550e8400-e29b-41d4-a716-446655440001',
          },
          dayOfWeek: {
            type: 'number',
            example: 1,
            description: '0 = domingo, 1 = segunda, ..., 6 = sábado',
          },
          startTime: { type: 'string', example: '2025-06-19T09:00:00.000Z' },
          endTime: { type: 'string', example: '2025-06-19T17:00:00.000Z' },
          isRecurring: { type: 'boolean', example: true },
          specificDate: { type: 'string', example: null },
          createdAt: { type: 'string', example: '2025-06-19T15:30:00.000Z' },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - Permissões insuficientes',
  })
  @ApiResponse({
    status: 404,
    description: 'Funcionário não encontrado',
  })
  async findByStaffId(@Param('staffId') staffId: string, @Req() req) {
    const schema = req.tenantSchema;

    const availableSlots = await this.getAvailableSlotByStaffIdUseCaseProxy
      .getInstance()
      .execute({
        schema,
        staffId,
      });

    return availableSlots.map((slot) => ({
      id: slot.id,
      staffId: slot.staffId,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime.toISOString(),
      endTime: slot.endTime.toISOString(),
      isRecurring: slot.isRecurring,
      specificDate: slot.specificDate?.toISOString(),
      createdAt: slot.createdAt?.toISOString(),
    }));
  }
  @Get('available-timeslots')
  @ApiOperation({
    summary: 'Obter todos os horários disponíveis em um período',
    description:
      'Retorna todos os horários em que um funcionário está disponível para agendamento de um serviço específico dentro de um período. Considera a duração do serviço e os agendamentos já existentes.',
  })
  @ApiQuery({
    name: 'staffId',
    description: 'ID único do funcionário',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: true,
  })
  @ApiQuery({
    name: 'serviceId',
    description:
      'ID único do serviço para calcular o tempo de duração do agendamento',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440002',
    required: true,
  })
  @ApiQuery({
    name: 'startDate',
    description:
      'Data inicial para buscar os horários disponíveis (formato ISO)',
    type: 'string',
    example: '2025-06-19T00:00:00.000Z',
    required: true,
  })
  @ApiQuery({
    name: 'endDate',
    description: 'Data final para buscar os horários disponíveis (formato ISO)',
    type: 'string',
    example: '2025-06-26T23:59:59.999Z',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de horários disponíveis',
    type: AvailableTimeslotsResponseDto,
    schema: {
      properties: {
        availableTimeslots: {
          type: 'array',
          description:
            'Lista de timestamps ISO representando os horários disponíveis',
          items: {
            type: 'string',
            example: '2025-06-19T10:00:00.000Z',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Parâmetros inválidos na requisição',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  async getAvailableTimeslots(
    @Query() queryParams: GetAvailableTimeslotsDto,
    @Req() req,
  ): Promise<AvailableTimeslotsResponseDto> {
    const schema = req.tenantSchema;

    // Converter os campos de string para Date
    const inputDto = new GetAvailableTimeslotsInputDto();
    inputDto.staffId = queryParams.staffId;
    inputDto.serviceId = queryParams.serviceId;
    inputDto.startDate = new Date(queryParams.startDate);
    inputDto.endDate = new Date(queryParams.endDate);

    const availableTimeslots = await this.getAvailableTimeslotsUseCaseProxy
      .getInstance()
      .execute({
        schema,
        data: inputDto,
      });

    // Formatar horários para ISO string
    return {
      availableTimeslots: availableTimeslots.map((date) => date.toISOString()),
    };
  }
}
