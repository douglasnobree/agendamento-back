import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { PaginationQuery } from '../../application/dtos/pagination.dto';

export const Pagination = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PaginationQuery => {
    const request = ctx.switchToHttp().getRequest();
    const page = parseInt(request.query.page, 10) || 1;
    const limit = parseInt(request.query.limit, 10) || 10;
    return { page, limit };
  },
);

export const ApiPaginationQuery = () => {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Número da página (começando de 1)',
      example: 1,
    })(target, key, descriptor);

    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Número de itens por página',
      example: 10,
    })(target, key, descriptor);

    return descriptor;
  };
};
