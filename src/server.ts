import DocumentController from './api/documents/document.controller';
import ParticipantController from './api/participant/participant.controller';
import UserController from './api/users/user.controllers';
import App from './app';
import { initializeDatabase } from './lib/database';

async function startServer() {
  await initializeDatabase(':memory:');

  const app = new App([
    new UserController(),
    new ParticipantController(),
    new DocumentController(),
  ]);

  app.listen();
}
startServer();
