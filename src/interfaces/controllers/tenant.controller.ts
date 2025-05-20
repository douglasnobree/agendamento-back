import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { TenantService } from '../../infra/prisma/tenant.service';
import { JwtAuthGuard } from '../../infra/auth/jwt-auth.guard';
import { RolesGuard } from '../../infra/auth/roles.guard';
import { Roles } from '../../infra/decorators/roles.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CreateTenantDto, TenantResponseDto } from '../dtos/tenant.dto';

@Controller('admin/tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiTags('Tenants')
@ApiBearerAuth()
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}
  @Post()
  @ApiOperation({ summary: 'Criar um novo tenant' })
  @ApiResponse({ status: 201, description: 'Tenant criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso proibido' })
  @ApiBody({
    type: CreateTenantDto,
    description: 'Dados do tenant',
  })
  async createTenant(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantService.createTenant(createTenantDto);
  }
  @Get()
  @ApiOperation({ summary: 'Listar todos os tenants' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tenants retornada com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso proibido' })
  async listTenants() {
    return this.tenantService.listTenants();
  }
  @Get(':id')
  @ApiOperation({ summary: 'Obter um tenant pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do tenant' })
  @ApiResponse({ status: 200, description: 'Tenant encontrado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso proibido' })
  @ApiResponse({ status: 404, description: 'Tenant não encontrado' })
  @ApiBody({
    type: CreateTenantDto,
    description: 'Dados do tenant',
  })
  async getTenant(@Param('id') id: string) {
    console.log('id', id);
    return this.tenantService.getTenantById(id);
  }
}
