import { Email, ISODatetime, Name, UUID } from '../../../@types/datatype';

export interface ParticipantRaw {
  id: UUID;
  document_id: UUID;
  name: Name;
  email: Email;
  status: string;
  signature: string;
  created_at: ISODatetime;
  updated_at: ISODatetime;
}

export class Participant {
  constructor(
    public readonly id: UUID,
    public readonly documentId: UUID,
    public readonly name: Name,
    public readonly email: Email,
    public readonly status: string,
    public readonly signature: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  public static fromJson(json: ParticipantRaw) {
    if (!json) return null;
    return new Participant(
      json.id,
      json.document_id,
      json.name,
      json.email,
      json.status,
      json.signature,
      new Date(json.created_at),
      new Date(json.updated_at),
    );
  }

  public toJson(): ParticipantJson {
    return {
      id: this.id,
      documentId: this.documentId,
      email: this.email,
      name: this.name,
      status: this.status,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}

export interface ParticipantJson {
  readonly id: UUID;
  readonly documentId: UUID;
  readonly name: Name;
  readonly email: Email;
  readonly status: string;
  readonly createdAt: ISODatetime;
  readonly updatedAt: ISODatetime;
}
