import { Encrypter } from 'src/domain/interfaces/cryptography/encrypter.interface' 
import * as bcrypt from 'bcrypt'

export class BcryptAdapter implements Encrypter {
  async encrypt(value: string): Promise<string> {
    return bcrypt.hash(value, 10)
  }

  async compare(value: string, hash: string): Promise<boolean> {
    return bcrypt.compare(value, hash)
  }
}
