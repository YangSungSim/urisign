import { MemoryStore } from 'express-session';
import { Email, UUID } from './datatype';

declare module 'express-session' {
  interface SessionData {
    email?: Email;
    csrfSecret?: string;
    csrfToken?: string;
    userId?: UUID;
    documentId?: UUID;
  }
}

declare module 'express' {
  interface Request {
    sessionStore: MemoryStore;
  }
}
