import { UserEmail } from '@/domain/value-objects/user-email';

describe('UserEmail Value Object', () => {
  describe('constructor', () => {
    it('should create a valid UserEmail when given a valid email', () => {
      const validEmails = [
        'test@example.com',
        'john.doe@domain.co.uk',
        'user123@subdomain.domain.com',
      ];

      validEmails.forEach((email) => {
        const userEmail = new UserEmail(email);
        expect(userEmail.value).toBe(email);
      });
    });

    it('should throw an error when given an invalid email', () => {
      const invalidEmails = [
        '',
        'notanemail',
        'missing@domain',
        '@domain.com',
        'user@.com',
        'user@domain.',
      ];

      invalidEmails.forEach((email) => {
        expect(() => new UserEmail(email)).toThrow('Invalid email address');
      });
    });
  });

  describe('value property', () => {
    it('should return the email string value', () => {
      const email = 'test@example.com';
      const userEmail = new UserEmail(email);

      expect(userEmail.value).toBe(email);
    });
  });

  describe('equals method', () => {
    it('should return true when comparing two UserEmails with the same value', () => {
      const email1 = new UserEmail('test@example.com');
      const email2 = new UserEmail('test@example.com');

      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false when comparing two UserEmails with different values', () => {
      const email1 = new UserEmail('test1@example.com');
      const email2 = new UserEmail('test2@example.com');

      expect(email1.equals(email2)).toBe(false);
    });

    it('should return false when comparing with a non-UserEmail object', () => {
      const email = new UserEmail('test@example.com');

      expect(email.equals('test@example.com' as unknown as UserEmail)).toBe(false);
    });
  });
});
