import { CreateServiceInputDto } from './service.dto';

export interface UpdateServiceInputDto extends Partial<CreateServiceInputDto> {
  id: string;
}
