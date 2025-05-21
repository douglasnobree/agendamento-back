import { CreateAppointmentInputDto } from './create-appointment.dto';

export interface UpdateAppointmentInputDto
  extends Partial<CreateAppointmentInputDto> {
  id: string;
}
