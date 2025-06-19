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
  @ApiProperty({ description: 'ID do funcionário' })
  @IsString()
  staffId: string;

  @ApiProperty({ description: 'Dia da semana (0 = domingo, 6 = sábado)' })
  @IsNumber()
  dayOfWeek: number;

  @ApiProperty({ description: 'Hora de início (formato ISO)' })
  @IsString() // Manteremos como string para facilitar a entrada no frontend
  startTime: string;

  @ApiProperty({ description: 'Hora de fim (formato ISO)' })
  @IsString() // Manteremos como string para facilitar a entrada no frontend
  endTime: string;

  @ApiProperty({ description: 'Se é recorrente toda semana', default: true })
  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @ApiProperty({
    description:
      'Data específica (formato ISO), usado quando isRecurring = false',
  })
  @IsString()
  @IsOptional()
  specificDate?: string;
}

export class UpdateAvailableSlotDto {
  @ApiProperty({ description: 'Dia da semana (0 = domingo, 6 = sábado)' })
  @IsNumber()
  @IsOptional()
  dayOfWeek?: number;

  @ApiProperty({ description: 'Hora de início (formato ISO)' })
  @IsString()
  @IsOptional()
  startTime?: string;

  @ApiProperty({ description: 'Hora de fim (formato ISO)' })
  @IsString()
  @IsOptional()
  endTime?: string;

  @ApiProperty({ description: 'Se é recorrente toda semana' })
  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @ApiProperty({
    description:
      'Data específica (formato ISO), usado quando isRecurring = false',
  })
  @IsString()
  @IsOptional()
  specificDate?: string;
}

export class GetAvailableTimeslotsDto {
  @ApiProperty({ description: 'ID do funcionário' })
  @IsString()
  staffId: string;

  @ApiProperty({ description: 'Data de início (formato ISO)' })
  @IsString()
  startDate: string;

  @ApiProperty({ description: 'Data de fim (formato ISO)' })
  @IsString()
  endDate: string;

  @ApiProperty({ description: 'ID do serviço para obter sua duração' })
  @IsString()
  serviceId: string;
}

export class AvailableTimeslotsResponseDto {
  @ApiProperty({ description: 'Lista de horários disponíveis', type: [String] })
  @IsArray()
  availableTimeslots: string[];
}
