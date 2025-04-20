import { User } from '@/domain/entities/user';
import { IUserRepository } from '@/domain/repository/user-repository';
import prisma from '../prisma';
import { UserEmail } from '@/domain/value-objects/user-email';
import { UserPassword } from '@/domain/value-objects/user-password';

export class UserRepository implements IUserRepository {
  async delete(user: User): Promise<void> {
    await prisma.user.delete({
      where: {
        id: user.id,
      },
    });
  }

  async save(user: User): Promise<void> {
    await prisma.user.create({
      data: {
        email: user.email.value,
        passwordHash: user.password.value,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (!user) {
      return null;
    }
    return new User(user.id, new UserEmail(user.email), UserPassword.fromHash(user.passwordHash));
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      return null;
    }
    return new User(user.id, new UserEmail(user.email), UserPassword.fromHash(user.passwordHash));
  }
}
