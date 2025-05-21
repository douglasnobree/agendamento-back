export interface CreateAppointmentInputDto {
  clientId: string;
  serviceId: string;
  staffId: string;
  scheduledAt: Date;
  status: string;
}

