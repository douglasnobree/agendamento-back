import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class CreateClientDto {
  @ApiProperty({ description: 'Nome do cliente', example: 'João Silva' })
  @IsString()
  @IsNotEmpty({ message: 'O nome do cliente é obrigatório' })
  name: string;

  @ApiProperty({ description: 'Email do cliente', example: 'joao@example.com' })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'O email do cliente é obrigatório' })
  email: string;

  @ApiProperty({
    description: 'Telefone do cliente',
    example: '11987654321',
    required: false,
  })
  @IsString()
  phone?: string;
}

export class UpdateClientDto {
  @ApiProperty({
    description: 'Nome do cliente',
    example: 'João Silva',
    required: false,
  })
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Email do cliente',
    example: 'joao@example.com',
    required: false,
  })
  @IsEmail({}, { message: 'Email inválido' })
  email?: string;

  @ApiProperty({
    description: 'Telefone do cliente',
    example: '11987654321',
    required: false,
  })
  @IsString()
  phone?: string;
}
