import { closeDatabase, initializeDatabase } from '../../src/lib/database';

beforeEach(async () => {
  await initializeDatabase(':memory:');
});

afterEach(async () => {
  await closeDatabase();
});
