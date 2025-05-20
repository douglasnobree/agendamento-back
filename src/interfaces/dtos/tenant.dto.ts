import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, IsString, IsUUID } from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({ description: 'Nome do tenant', example: 'Barbearia Example' })
  @IsString()
  @IsNotEmpty({ message: 'O nome do tenant é obrigatório' })
  name: string;

  @ApiProperty({
    description: 'Email do proprietário',
    example: 'admin@example.com',
  })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'O email do proprietário é obrigatório' })
  ownerEmail: string;

  @ApiProperty({ description: 'ID do plano', example: 'pl_123456789' })
  @IsString()
  @IsNotEmpty({ message: 'O ID do plano é obrigatório' })
  planId: string;
}

export class TenantResponseDto {
  @ApiProperty({ description: 'ID do tenant' })
  id: string;

  @ApiProperty({ description: 'Nome do tenant' })
  name: string;

  @ApiProperty({ description: 'Schema do banco de dados' })
  schema: string;

  @ApiProperty({ description: 'Email do proprietário' })
  ownerEmail: string;

  @ApiProperty({ description: 'ID do plano' })
  planId: string;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;
}
