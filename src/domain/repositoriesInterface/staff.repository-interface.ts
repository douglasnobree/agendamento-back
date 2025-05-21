import { Staff } from '../entities/staff.entity';

export interface StaffRepository {
  findById(schema: string, id: string): Promise<Staff | null>;
  findAll(schema: string): Promise<Staff[]>;
  save(schema: string, staff: Staff): Promise<void>;
  remove(schema: string, id: string): Promise<void>;
  update(schema: string, staff: Staff): Promise<void>;
  hashPassword(password: string): Promise<string>;
}
