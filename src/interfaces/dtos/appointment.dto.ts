import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({ description: 'ID do cliente', example: 'client-uuid' })
  @IsString()
  @IsNotEmpty({ message: 'O ID do cliente é obrigatório' })
  clientId: string;

  @ApiProperty({ description: 'ID do serviço', example: 'service-uuid' })
  @IsString()
  @IsNotEmpty({ message: 'O ID do serviço é obrigatório' })
  serviceId: string;

  @ApiProperty({ description: 'ID do staff', example: 'staff-uuid' })
  @IsString()
  @IsNotEmpty({ message: 'O ID do staff é obrigatório' })
  staffId: string;

  @ApiProperty({
    description: 'Data do agendamento (YYYY-MM-DD)',
    example: '2025-06-19',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'A data deve estar no formato YYYY-MM-DD' })
  @IsNotEmpty({ message: 'A data é obrigatória' })
  scheduledDate: string;

  @ApiProperty({
    description: 'Horário do agendamento (HH:MM)',
    example: '14:30',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'O horário deve estar no formato HH:MM (24h)' })
  @IsNotEmpty({ message: 'O horário é obrigatório' })
  scheduledTime: string;

  @ApiProperty({ description: 'Status', example: 'pending' })
  @IsString()
  @IsNotEmpty({ message: 'O status é obrigatório' })
  status: string;
}

export class UpdateAppointmentDto {
  @ApiProperty({
    description: 'ID do cliente',
    example: 'client-uuid',
    required: false,
  })
  @IsString()
  clientId?: string;

  @ApiProperty({
    description: 'ID do serviço',
    example: 'service-uuid',
    required: false,
  })
  @IsString()
  serviceId?: string;

  @ApiProperty({
    description: 'ID do staff',
    example: 'staff-uuid',
    required: false,
  })
  @IsString()
  staffId?: string;

  @ApiProperty({
    description: 'Data do agendamento (YYYY-MM-DD)',
    example: '2025-06-19',
    required: false,
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'A data deve estar no formato YYYY-MM-DD' })
  scheduledDate?: string;

  @ApiProperty({
    description: 'Horário do agendamento (HH:MM)',
    example: '14:30',
    required: false,
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'O horário deve estar no formato HH:MM (24h)' })
  scheduledTime?: string;

  @ApiProperty({
    description: 'Status',
    example: 'confirmed',
    required: false,
  })
  @IsString()
  status?: string;
}

export class AvailableTimeslotsResponseDto {
  @ApiProperty({
    description: 'Lista de horários disponíveis no formato YYYY-MM-DD HH:MM',
    type: [String],
    example: ['2025-06-19 10:00', '2025-06-19 10:30', '2025-06-19 11:00'],
  })
  availableTimeslots: string[];
}
