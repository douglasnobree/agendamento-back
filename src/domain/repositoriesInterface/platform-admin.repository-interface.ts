import { PlatformAdmin } from '../entities/platform-admin.entity';

export interface PlatformAdminRepository {
  findByEmail(email: string): Promise<PlatformAdmin | null>;
  findById(id: string): Promise<PlatformAdmin | null>;
  list(): Promise<PlatformAdmin[]>;
  save(admin: PlatformAdmin): Promise<void>;
  remove(id: string): Promise<void>;
  update(admin: PlatformAdmin): Promise<void>;
  verifyPassword(password: string, hashedPassword: string): Promise<boolean>;
}
