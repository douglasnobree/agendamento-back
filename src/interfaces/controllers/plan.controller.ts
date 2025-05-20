import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PostgresService } from '../../infra/db/postgres/postgres.service';
import { JwtAuthGuard } from '../../infra/auth/jwt-auth.guard';
import { RolesGuard } from '../../infra/auth/roles.guard';
import { Roles } from '../../infra/decorators/roles.decorator';

class CreatePlanDto {
  name: string;
  description: string;
  price: number;
  features: any;
}

class UpdatePlanDto {
  name?: string;
  description?: string;
  price?: number;
  features?: any;
}

@Controller('admin/plans')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class PlanController {
  constructor(private readonly postgres: PostgresService) {}

  @Get()
  async findAll() {
    const result = await this.postgres.query('SELECT * FROM public."Plan"');
    return result.rows;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.postgres.query(
      'SELECT * FROM public."Plan" WHERE id = $1',
      [id],
    );
    return result.rows[0];
  }

  @Post()
  async create(@Body() data: CreatePlanDto) {
    const result = await this.postgres.query(
      'INSERT INTO public."Plan" (id, name, description, price, features) VALUES (gen_random_uuid(), $1, $2, $3, $4) RETURNING *',
      [data.name, data.description, data.price, data.features],
    );
    return result.rows[0];
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdatePlanDto) {
    const result = await this.postgres.query(
      'UPDATE public."Plan" SET name = $1, description = $2, price = $3, features = $4 WHERE id = $5 RETURNING *',
      [data.name, data.description, data.price, data.features, id],
    );
    return result.rows[0];
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.postgres.query('DELETE FROM public."Plan" WHERE id = $1', [id]);
    return { success: true };
  }
}
