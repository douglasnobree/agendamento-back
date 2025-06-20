import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsDate,
  IsBoolean,
  IsOptional,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAvailableSlotDto {
  @ApiProperty({
    description: 'ID do funcionário',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: true,
  })
  @IsString()
  staffId: string;

  @ApiProperty({
    description: 'Dia da semana (0 = domingo, 1 = segunda, ..., 6 = sábado)',
    example: 1,
    required: true,
  })
  @IsNumber()
  dayOfWeek: number;

  @ApiProperty({
    description: 'Hora de início no formato HH:MM',
    example: '09:00',
    required: true,
  })
  @IsString() // Manteremos como string para facilitar a entrada no frontend
  startTime: string;

  @ApiProperty({
    description: 'Hora de fim no formato HH:MM',
    example: '17:00',
    required: true,
  })
  @IsString() // Manteremos como string para facilitar a entrada no frontend
  endTime: string;

  @ApiProperty({
    description: 'Indica se o horário é recorrente semanalmente',
    default: true,
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @ApiProperty({
    description:
      'Data específica no formato YYYY-MM-DD, usado quando isRecurring = false',
    example: '2025-07-15',
    required: false,
  })
  @IsString()
  @IsOptional()
  specificDate?: string;
}

export class UpdateAvailableSlotDto {
  @ApiProperty({
    description: 'Dia da semana (0 = domingo, 1 = segunda, ..., 6 = sábado)',
    example: 2,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  dayOfWeek?: number;

  @ApiProperty({
    description: 'Hora de início no formato HH:MM',
    example: '10:00',
    required: false,
  })
  @IsString()
  @IsOptional()
  startTime?: string;

  @ApiProperty({
    description: 'Hora de fim no formato HH:MM',
    example: '18:00',
    required: false,
  })
  @IsString()
  @IsOptional()
  endTime?: string;

  @ApiProperty({
    description: 'Indica se o horário é recorrente semanalmente',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @ApiProperty({
    description:
      'Data específica no formato YYYY-MM-DD, usado quando isRecurring = false',
    example: '2025-08-20',
    required: false,
  })
  @IsString()
  @IsOptional()
  specificDate?: string;
}

export class GetAvailableTimeslotsDto {
  @ApiProperty({
    description: 'ID único do funcionário para verificar horários disponíveis',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: true,
  })
  @IsString()
  staffId: string;

  @ApiProperty({
    description:
      'Data inicial do período de busca no formato YYYY-MM-DD ou ISO 8601',
    example: '2025-06-19',
    required: true,
  })
  @IsString()
  startDate: string;

  @ApiProperty({
    description:
      'Data final do período de busca no formato YYYY-MM-DD ou ISO 8601',
    example: '2025-06-26',
    required: true,
  })
  @IsString()
  endDate: string;

  @ApiProperty({
    description: 'ID do serviço para calcular a duração necessária do horário',
    example: '550e8400-e29b-41d4-a716-446655440002',
    required: true,
  })
  @IsString()
  serviceId: string;
}

export class AvailableTimeslotsResponseDto {
  @ApiProperty({
    description: 'Lista de horários disponíveis no formato ISO 8601',
    type: [String],
    example: [
      '2025-06-19T09:00:00.000Z',
      '2025-06-19T09:15:00.000Z',
      '2025-06-19T09:30:00.000Z',
      '2025-06-20T14:00:00.000Z',
    ],
  })
  @IsArray()
  availableTimeslots: string[];
}
