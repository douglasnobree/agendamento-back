import { CreateStaffInputDto } from './staff.dto';

export interface UpdateStaffInputDto extends Partial<CreateStaffInputDto> {
  id: string;
}
