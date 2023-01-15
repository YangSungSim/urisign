import {
  Email,
  ISODatetime,
  Name,
  Password,
  UUID,
} from '../../../@types/datatype';

export interface UserRaw {
  readonly id: UUID;
  readonly email: Email;
  readonly name: Name;
  readonly password: Password;
  readonly created_at: ISODatetime;
  readonly updated_at: ISODatetime;
}

export class User {
  constructor(
    public readonly id: UUID,
    public readonly email: Email,
    public readonly name: Name,
    public readonly password: Password,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  public static fromJson(json: UserRaw) {
    if (!json) return null;
    return new User(
      json.id,
      json.email,
      json.name,
      json.password,
      new Date(json.created_at),
      new Date(json.updated_at),
    );
  }

  public toJson(): UserJson {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}

export interface UserJson {
  readonly id: UUID;
  readonly email: Email;
  readonly name: Name;
  readonly createdAt: ISODatetime;
  readonly updatedAt: ISODatetime;
}
