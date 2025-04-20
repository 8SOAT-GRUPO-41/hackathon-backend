import bcrypt from 'bcryptjs';
import { ValueObject } from '@/domain/common/vo';

interface UserPasswordProps {
  value: string;
  hashed: boolean;
}

export class UserPassword extends ValueObject<string> {
  private static readonly SALT_ROUNDS = 10;

  private constructor({ value, hashed }: UserPasswordProps) {
    super(value);
    if (!hashed && !UserPassword.validate(value)) {
      throw new Error('Password does not meet complexity requirements');
    }
  }

  public static async create(plainText: string): Promise<UserPassword> {
    if (!UserPassword.validate(plainText)) {
      throw new Error('Password does not meet complexity requirements');
    }
    const hashedValue = await bcrypt.hash(plainText, UserPassword.SALT_ROUNDS);
    return new UserPassword({ value: hashedValue, hashed: true });
  }

  public static fromHash(hashed: string): UserPassword {
    return new UserPassword({ value: hashed, hashed: true });
  }

  public async compare(plainText: string): Promise<boolean> {
    return bcrypt.compare(plainText, this._value);
  }

  public static validate(password: string): boolean {
    return password.length >= 8;
  }
}
