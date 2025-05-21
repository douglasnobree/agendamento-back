import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlanDto {
  @ApiProperty({ description: 'Nome do plano' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Descrição do plano' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Preço do plano' })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ description: 'Features do plano' })
  features: any;
}

export class UpdatePlanDto {
  @ApiProperty({ description: 'Nome do plano' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Descrição do plano' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Preço do plano' })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiProperty({ description: 'Features do plano' })
  @IsOptional()
  features?: any;
}

export class PlanResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  features: any;
}
