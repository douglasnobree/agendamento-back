import { AvailableSlot } from '../entities/available-slot.entity';

export interface AvailableSlotRepository {
  findById(schema: string, id: string): Promise<AvailableSlot | null>;
  findByStaffId(schema: string, staffId: string): Promise<AvailableSlot[]>;
  findAvailableSlotsByDateRange(
    schema: string,
    staffId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<AvailableSlot[]>;
  save(schema: string, availableSlot: AvailableSlot): Promise<void>;
  saveMany(schema: string, availableSlots: AvailableSlot[]): Promise<void>;
  remove(schema: string, id: string): Promise<void>;
  update(schema: string, availableSlot: AvailableSlot): Promise<void>;
  isSlotAvailable(
    schema: string,
    staffId: string,
    dateTime: Date,
    durationMinutes: number,
    excludeAppointmentId?: string,
  ): Promise<boolean>;

  getAvailableTimeslots(
    schema: string,
    staffId: string,
    startDate: Date,
    endDate: Date,
    serviceDurationMinutes: number,
  ): Promise<Date[]>;
}
