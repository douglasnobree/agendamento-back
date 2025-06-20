export interface CreateAppointmentInputDto {
  clientId: string;
  serviceId: string;
  staffId: string;
  scheduledDate: string; // Formato YYYY-MM-DD
  scheduledTime: string; // Formato HH:MM (24h)
  status: string;
}
