import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createClient, type Client } from "@libsql/client";

/**
 * libSQL: SQLite with the same SQL, reachable two ways.
 *
 *  - On Vercel (or anywhere serverless) it talks to a Turso database over the
 *    network. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN
 *  - On your machine and in Docker it opens a plain file at DATABASE_PATH
 *    (default ./data/paylane.db). Use ":memory:" for a throwaway database.
 *
 * SERVER ONLY. Never import this from a component that runs in the browser.
 */

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS payments (
    id             TEXT PRIMARY KEY,
    created_at     TEXT NOT NULL,
    customer       TEXT NOT NULL,
    description    TEXT NOT NULL,
    method         TEXT NOT NULL,
    brand          TEXT NOT NULL,
    last4          TEXT NOT NULL,
    status         TEXT NOT NULL,
    gross_cents    INTEGER NOT NULL,
    fee_cents      INTEGER NOT NULL,
    net_cents      INTEGER NOT NULL,
    usdc_micro     INTEGER NOT NULL,
    failure_reason TEXT,
    network        TEXT,
    wallet_address TEXT,
    owner_hash     TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS payments_created_at ON payments (created_at DESC);
  CREATE INDEX IF NOT EXISTS payments_owner ON payments (owner_hash);
`;

/** Opens a database and makes sure the tables exist */
export async function openDatabase(
  target: string,
  authToken?: string,
): Promise<Client> {
  const remote = /^(libsql|https?|wss?):/.test(target);
  let url = target;
  if (!remote) {
    if (target === ":memory:") {
      url = ":memory:";
    } else {
      const path = resolve(target.replace(/^file:/, ""));
      mkdirSync(dirname(path), { recursive: true });
      url = `file:${path}`;
    }
  }
  const client = createClient({
    url,
    authToken: remote ? authToken : undefined,
  });
  if (!remote) {
    // WAL lets reads continue while a payment is being written
    await client.execute("PRAGMA busy_timeout = 3000");
    if (url !== ":memory:") await client.execute("PRAGMA journal_mode = WAL");
  }
  await client.executeMultiple(SCHEMA);
  return client;
}

// Next re-evaluates modules during development, so keep one connection on globalThis
const globalForDb = globalThis as unknown as { __paylaneDb?: Promise<Client> };

export function getDb(): Promise<Client> {
  if (!globalForDb.__paylaneDb) {
    const remoteUrl = process.env.TURSO_DATABASE_URL;
    const opening = remoteUrl
      ? openDatabase(remoteUrl, process.env.TURSO_AUTH_TOKEN)
      : openDatabase(process.env.DATABASE_PATH ?? "data/paylane.db");
    // A failed attempt must not be remembered, or every later request would fail too
    opening.catch(() => {
      globalForDb.__paylaneDb = undefined;
    });
    globalForDb.__paylaneDb = opening;
  }
  return globalForDb.__paylaneDb;
}
