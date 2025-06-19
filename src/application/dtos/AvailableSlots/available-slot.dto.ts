import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsDate,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAvailableSlotInputDto {
  @ApiProperty({ description: 'ID do funcionário' })
  @IsString()
  staffId: string;

  @ApiProperty({ description: 'Dia da semana (0 = domingo, 6 = sábado)' })
  @IsNumber()
  dayOfWeek: number;

  @ApiProperty({ description: 'Hora de início (formato ISO)' })
  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @ApiProperty({ description: 'Hora de fim (formato ISO)' })
  @IsDate()
  @Type(() => Date)
  endTime: Date;

  @ApiProperty({ description: 'Se é recorrente toda semana', default: true })
  @IsBoolean()
  @IsOptional()
  isRecurring: boolean = true;

  @ApiProperty({
    description:
      'Data específica (formato ISO), usado quando isRecurring = false',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  specificDate?: Date;
}

export class UpdateAvailableSlotInputDto {
  @ApiProperty({ description: 'Dia da semana (0 = domingo, 6 = sábado)' })
  @IsNumber()
  @IsOptional()
  dayOfWeek?: number;

  @ApiProperty({ description: 'Hora de início (formato ISO)' })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  startTime?: Date;

  @ApiProperty({ description: 'Hora de fim (formato ISO)' })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  endTime?: Date;

  @ApiProperty({ description: 'Se é recorrente toda semana' })
  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @ApiProperty({
    description:
      'Data específica (formato ISO), usado quando isRecurring = false',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  specificDate?: Date;
}

export class GetAvailableTimeslotsInputDto {
  @ApiProperty({ description: 'ID do funcionário' })
  @IsString()
  staffId: string;

  @ApiProperty({ description: 'Data de início (formato ISO)' })
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({ description: 'Data de fim (formato ISO)' })
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @ApiProperty({ description: 'ID do serviço para obter sua duração' })
  @IsString()
  serviceId: string;
}
