import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ description: 'Nome do serviço', example: 'Corte de cabelo' })
  @IsString()
  @IsNotEmpty({ message: 'O nome do serviço é obrigatório' })
  name: string;

  @ApiProperty({
    description: 'Descrição do serviço',
    example: 'Corte com tesoura e máquina',
    required: false,
  })
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Duração do serviço em minutos', example: 30 })
  @IsNumber()
  @IsNotEmpty({ message: 'A duração é obrigatória' })
  duration: number;

  @ApiProperty({ description: 'Preço do serviço', example: 50.0 })
  @IsNumber()
  @IsNotEmpty({ message: 'O preço é obrigatório' })
  price: number;
}

export class UpdateServiceDto {
  @ApiProperty({
    description: 'Nome do serviço',
    example: 'Corte de cabelo',
    required: false,
  })
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Descrição do serviço',
    example: 'Corte com tesoura e máquina',
    required: false,
  })
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Duração do serviço em minutos',
    example: 30,
    required: false,
  })
  @IsNumber()
  duration?: number;

  @ApiProperty({
    description: 'Preço do serviço',
    example: 50.0,
    required: false,
  })
  @IsNumber()
  price?: number;
}
