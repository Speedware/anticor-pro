import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { config } from "./config";

fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });

export const db = new DatabaseSync(config.dbPath);
db.exec("PRAGMA journal_mode = WAL;");

db.exec(`
  CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    car TEXT NOT NULL,
    comment TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'closed')),
    telegram_chat_id TEXT,
    telegram_message_id INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    closed_at TEXT
  );
`);

export type RequestStatus = "open" | "closed";

export interface RequestRow {
  id: number;
  name: string;
  phone: string;
  car: string;
  comment: string | null;
  status: RequestStatus;
  telegram_chat_id: string | null;
  telegram_message_id: number | null;
  created_at: string;
  closed_at: string | null;
}

export interface NewRequest {
  name: string;
  phone: string;
  car: string;
  comment: string | null;
}

export function createRequest(data: NewRequest): RequestRow {
  const result = db
    .prepare(`INSERT INTO requests (name, phone, car, comment) VALUES (?, ?, ?, ?)`)
    .run(data.name, data.phone, data.car, data.comment);
  return getRequest(Number(result.lastInsertRowid))!;
}

export function getRequest(id: number): RequestRow | undefined {
  return db.prepare(`SELECT * FROM requests WHERE id = ?`).get(id) as
    | RequestRow
    | undefined;
}

export function setTelegramMessage(
  id: number,
  chatId: string,
  messageId: number
): void {
  db.prepare(
    `UPDATE requests SET telegram_chat_id = ?, telegram_message_id = ? WHERE id = ?`
  ).run(chatId, messageId, id);
}

export function closeRequest(id: number): RequestRow | undefined {
  db.prepare(
    `UPDATE requests SET status = 'closed', closed_at = datetime('now') WHERE id = ? AND status = 'open'`
  ).run(id);
  return getRequest(id);
}

export function deleteExpiredRequests(retentionYears: number): number {
  const result = db
    .prepare(
      `DELETE FROM requests WHERE created_at < datetime('now', '-' || ? || ' years')`
    )
    .run(retentionYears);
  return Number(result.changes);
}

export function countByStatus(): { open: number; closed: number } {
  const rows = db
    .prepare(`SELECT status, COUNT(*) as count FROM requests GROUP BY status`)
    .all() as { status: RequestStatus; count: number }[];
  const result = { open: 0, closed: 0 };
  for (const row of rows) {
    result[row.status] = row.count;
  }
  return result;
}
