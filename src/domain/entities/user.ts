import { Entity } from '@/domain/common/entity';
import { UserEmail } from '@/domain/value-objects/user-email';
import { Notification } from '@/domain/entities/notification';
import { Video } from '@/domain/entities/video';
import { UserPassword } from '../value-objects/user-password';

export class User extends Entity<string> {
  private _email: UserEmail;
  private _password: UserPassword;
  private _createdAt: Date;
  private _videos: Video[];
  private _notifications: Notification[];

  constructor(
    id: string,
    email: UserEmail,
    password: UserPassword,
    createdAt: Date = new Date(),
    videos: Video[] = [],
    notifications: Notification[] = [],
  ) {
    super(id);
    this._email = email;
    this._password = password;
    this._createdAt = createdAt;
    this._videos = videos;
    this._notifications = notifications;
  }

  static create(email: UserEmail, password: UserPassword): User {
    return new User(crypto.randomUUID(), email, password);
  }

  get email(): UserEmail {
    return this._email;
  }

  get password(): UserPassword {
    return this._password;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get videos(): Video[] {
    return this._videos;
  }

  get notifications(): Notification[] {
    return this._notifications;
  }

  addVideo(video: Video): void {
    this._videos.push(video);
  }

  addNotification(notification: Notification): void {
    this._notifications.push(notification);
  }
}
