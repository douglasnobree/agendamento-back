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
import { JwtAuthGuard } from '../../infra/auth/jwt-auth.guard';
import { RolesGuard } from '../../infra/auth/roles.guard';
import { Roles } from '../../infra/decorators/roles.decorator';
import { UseCaseProxy } from '../../application/usecases/usecase-proxy';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiTags,
  ApiOperation,
  ApiResponse,
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
  description: 'Identificador do tenant',
  required: true,
  schema: { type: 'string' },
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
  @ApiOperation({ summary: 'Criar um novo horário disponível' })
  @ApiResponse({
    status: 201,
    description: 'Horário disponível criado com sucesso',
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
  })
  @ApiResponse({ status: 200, description: 'Lista de horários disponíveis' })
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
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de horários disponíveis',
    type: AvailableTimeslotsResponseDto,
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
