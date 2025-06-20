import { CreateAppointmentInputDto } from './create-appointment.dto';

export interface UpdateAppointmentInputDto
  extends Partial<CreateAppointmentInputDto> {
  id: string;
  scheduledAt?: string; // Formato ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)
}
