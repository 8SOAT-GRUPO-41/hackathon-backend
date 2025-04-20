import { ValueObject } from '@/domain/common/vo';

export class UserEmail extends ValueObject<string> {
  constructor(email: string) {
    super(email);
    if (!this.validate(email)) {
      throw new Error('Invalid email address');
    }
  }

  private validate(email: string): boolean {
    const emailRegex = /\S+@\S+\.\S+/;
    return emailRegex.test(email);
  }
}
