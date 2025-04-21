import { User } from '@/domain/entities/user';
import { IUserRepository } from '@/domain/repository/user-repository';
import { UserEmail } from '@/domain/value-objects/user-email';
import { UserPassword } from '@/domain/value-objects/user-password';

class MockUserRepository implements IUserRepository {
  private users: User[] = [];

  async findById(id: string): Promise<User | null> {
    const user = this.users.find((u) => u.id === id);
    return user || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.users.find((u) => u.email.value === email);
    return user || null;
  }

  async save(user: User): Promise<void> {
    const index = this.users.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      this.users[index] = user;
    } else {
      this.users.push(user);
    }
  }

  async delete(user: User): Promise<void> {
    const index = this.users.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      this.users.splice(index, 1);
    }
  }
}

describe('UserRepository Interface', () => {
  let repository: IUserRepository;
  let mockEmail: UserEmail;
  let mockPassword: UserPassword;
  let user: User;

  beforeEach(() => {
    repository = new MockUserRepository();
    mockEmail = new UserEmail('test@example.com');
    mockPassword = { value: 'hashedpassword' } as UserPassword;
    user = new User('user-id-123', mockEmail, mockPassword);
  });

  describe('findById', () => {
    it('should return the user when found by id', async () => {
      await repository.save(user);

      const result = await repository.findById(user.id);

      expect(result).toBe(user);
    });

    it('should return null when user is not found by id', async () => {
      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return the user when found by email', async () => {
      await repository.save(user);

      const result = await repository.findByEmail(mockEmail.value);

      expect(result).toBe(user);
    });

    it('should return null when user is not found by email', async () => {
      const result = await repository.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('should add a new user when it does not exist', async () => {
      await repository.save(user);

      const savedUser = await repository.findById(user.id);

      expect(savedUser).toBe(user);
    });

    it('should update an existing user', async () => {
      await repository.save(user);

      const newEmail = new UserEmail('updated@example.com');
      const updatedUser = new User(user.id, newEmail, mockPassword);

      await repository.save(updatedUser);

      const result = await repository.findById(user.id);

      expect(result).toBe(updatedUser);
      expect(result?.email.value).toBe(newEmail.value);
    });
  });

  describe('delete', () => {
    it('should remove a user when it exists', async () => {
      await repository.save(user);

      await repository.delete(user);

      const result = await repository.findById(user.id);

      expect(result).toBeNull();
    });

    it('should not throw an error when trying to delete a non-existent user', async () => {
      const nonExistentUser = new User('non-existent-id', mockEmail, mockPassword);

      await expect(repository.delete(nonExistentUser)).resolves.not.toThrow();
    });
  });
});
