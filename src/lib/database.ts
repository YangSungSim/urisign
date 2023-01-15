import Database from 'better-sqlite3';
import fs from 'fs';

export let db: Database.Database;

export async function initializeDatabase(
  filename: string,
  options?: Database.Options,
) {
  db = new Database(filename, options);

  const schema = fs.readFileSync('schema.sql').toString('utf-8');
  db.exec(schema);

  const data = fs.readFileSync('data.sql').toString('utf-8');
  db.exec(data);

  const stmt = db.prepare('SELECT * FROM users');
  const cats = stmt.all();

  const stmt2 = db.prepare('SELECT * FROM documents');
  const cats2 = stmt2.all();

  const stmt3 = db.prepare('SELECT * FROM participants');
  const cats3 = stmt3.all();

  const stmt4 = db.prepare('SELECT * FROM participant_histories');
  const cats4 = stmt3.all();
  
  console.log("data insert on going");
  console.log(cats);
  console.log(cats2);
  console.log(cats3);
  console.log(cats4);
}

export async function closeDatabase() {
  db?.close();
}

export function transaction<T>(cb: () => T) {
  let result: T;
  db.transaction(() => {
    result = cb();
  })();
  return result;
}
