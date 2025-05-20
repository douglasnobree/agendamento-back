import { Owner } from '../entities/owner.entity';

export interface OwnerRepository {
  findByEmail(schema: string, email: string): Promise<Owner | null>;
  findById(schema: string, id: string): Promise<Owner | null>;
  findAll(schema: string): Promise<Owner[]>;
  save(schema: string, owner: Owner): Promise<void>;
  remove(schema: string, id: string): Promise<void>;
  update(schema: string, owner: Owner): Promise<void>;
}
