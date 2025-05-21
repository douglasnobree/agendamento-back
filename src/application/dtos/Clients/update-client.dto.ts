import { CreateClientInputDto } from './create-client.dto';

export interface UpdateClientInputDto extends Partial<CreateClientInputDto> {
  id: string;
}
