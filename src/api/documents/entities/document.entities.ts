import { Email, ISODatetime, Name, UUID } from '../../../@types/datatype';

export interface DocumentRaw {
    id: UUID;
    user_id: UUID;
    title: Name;
    content: Email;
    status: string;
    created_at: ISODatetime;
    updated_at: ISODatetime;
}

export class Document {
constructor(
    public readonly id: UUID,
    public readonly userId: UUID,
    public readonly title: string,
    public readonly content: string,
    public readonly status: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
) {}

public static fromJson(json: DocumentRaw) {
    if (!json) return null;
    return new Document(
    json.id,
    json.user_id,
    json.title,
    json.content,
    json.status,
    new Date(json.created_at),
    new Date(json.updated_at),
    );
}

public toJson(): DocumentJson {
    return {
    id: this.id,
    userId: this.userId,
    title: this.title,
    content: this.content,
    status: this.status,
    createdAt: this.createdAt.toISOString(),
    updatedAt: this.updatedAt.toISOString(),
    };
}
}

export interface DocumentJson {
    readonly id: UUID;
    readonly userId: UUID;
    readonly title: string;
    readonly content: string;
    readonly status: string;
    readonly createdAt: ISODatetime;
    readonly updatedAt: ISODatetime;
}