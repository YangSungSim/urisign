import { Email, Name, UUID } from '../../../@types/datatype';

export interface PartDto {
  name: Name;
  email: Email;
}

export interface CreateDto {
  title: string;
  content: string;
  participants: PartDto[];
}



export type CreateResponse = {
  documentId: UUID;
};