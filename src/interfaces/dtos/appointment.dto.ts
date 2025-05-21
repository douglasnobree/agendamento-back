import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

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
    description: 'Data e hora agendada',
    example: '2025-05-20T14:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty({ message: 'A data/hora é obrigatória' })
  scheduledAt: Date;

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
    description: 'Data e hora agendada',
    example: '2025-05-20T14:00:00.000Z',
    required: false,
  })
  @IsDateString()
  scheduledAt?: Date;

  @ApiProperty({ description: 'Status', example: 'pending', required: false })
  @IsString()
  status?: string;
}
