import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import postgres from "postgres";
import { getDatabaseUrl } from "@/lib/env";

export type ApplicationStatus = "pending" | "approved" | "rejected";

export type Registration = {
  twitterUserId: string;
  twitterHandle: string;
  walletAddress: string | null;
  liked: boolean;
  retweeted: boolean;
  submittedAt: string;
  status: ApplicationStatus;
  reviewedAt: string | null;
};

type Store = {
  upsert(entry: Omit<Registration, "status" | "reviewedAt"> & { status?: ApplicationStatus }): Promise<void>;
  get(twitterUserId: string): Promise<Registration | null>;
  getByHandle(handle: string): Promise<Registration | null>;
  list(status?: ApplicationStatus): Promise<Registration[]>;
  setStatus(twitterUserId: string, status: ApplicationStatus): Promise<Registration | null>;
};

const STATUSES = new Set<ApplicationStatus>(["pending", "approved", "rejected"]);

export function parseStatus(value: string | null | undefined): ApplicationStatus | null {
  if (!value) return null;
  return STATUSES.has(value as ApplicationStatus) ? (value as ApplicationStatus) : null;
}

function sqlitePath(url: string): string {
  if (process.env.VERCEL) {
    return "/tmp/umbra.sqlite";
  }
  const stripped = url.replace(/^file:/, "");
  return path.resolve(process.cwd(), stripped);
}

function mapRow(row: {
  twitter_user_id: string;
  twitter_handle: string;
  wallet_address: string | null;
  liked: number | boolean;
  retweeted: number | boolean;
  registered_at: string;
  status?: string | null;
  reviewed_at?: string | null;
}): Registration {
  return {
    twitterUserId: row.twitter_user_id,
    twitterHandle: row.twitter_handle,
    walletAddress: row.wallet_address,
    liked: Boolean(row.liked),
    retweeted: Boolean(row.retweeted),
    submittedAt: row.registered_at,
    status: parseStatus(row.status) ?? "pending",
    reviewedAt: row.reviewed_at ?? null,
  };
}

const SELECT_COLS = `twitter_user_id, twitter_handle, wallet_address, liked, retweeted, registered_at, status, reviewed_at`;

function createSqliteStore(filePath: string): Store {
  mkdirSync(path.dirname(filePath), { recursive: true });
  const db = new DatabaseSync(filePath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS registrations (
      twitter_user_id TEXT PRIMARY KEY,
      twitter_handle TEXT NOT NULL,
      wallet_address TEXT,
      liked INTEGER NOT NULL DEFAULT 0,
      retweeted INTEGER NOT NULL DEFAULT 0,
      registered_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      reviewed_at TEXT
    )
  `);
  const cols = (
    db.prepare(`PRAGMA table_info(registrations)`).all() as { name: string }[]
  ).map((col) => col.name);
  if (!cols.includes("status")) {
    db.exec(`ALTER TABLE registrations ADD COLUMN status TEXT NOT NULL DEFAULT 'pending'`);
  }
  if (!cols.includes("reviewed_at")) {
    db.exec(`ALTER TABLE registrations ADD COLUMN reviewed_at TEXT`);
  }

  return {
    async upsert(entry) {
      db.prepare(
        `INSERT INTO registrations
          (twitter_user_id, twitter_handle, wallet_address, liked, retweeted, registered_at, status, reviewed_at)
         VALUES (?, ?, ?, ?, ?, ?, 'pending', NULL)
         ON CONFLICT(twitter_user_id) DO UPDATE SET
          twitter_handle = excluded.twitter_handle,
          wallet_address = excluded.wallet_address,
          liked = excluded.liked,
          retweeted = excluded.retweeted,
          status = CASE
            WHEN registrations.wallet_address IS NOT excluded.wallet_address THEN 'pending'
            ELSE registrations.status
          END,
          reviewed_at = CASE
            WHEN registrations.wallet_address IS NOT excluded.wallet_address THEN NULL
            ELSE registrations.reviewed_at
          END`
      ).run(
        entry.twitterUserId,
        entry.twitterHandle,
        entry.walletAddress,
        entry.liked ? 1 : 0,
        entry.retweeted ? 1 : 0,
        entry.submittedAt
      );
    },
    async get(twitterUserId) {
      const row = db.prepare(`SELECT ${SELECT_COLS} FROM registrations WHERE twitter_user_id = ?`).get(
        twitterUserId
      ) as Parameters<typeof mapRow>[0] | undefined;
      return row ? mapRow(row) : null;
    },
    async getByHandle(handle) {
      const normalized = handle.replace(/^@/, "").toLowerCase();
      const row = db
        .prepare(
          `SELECT ${SELECT_COLS} FROM registrations WHERE lower(twitter_handle) = ? ORDER BY registered_at DESC LIMIT 1`
        )
        .get(normalized) as Parameters<typeof mapRow>[0] | undefined;
      return row ? mapRow(row) : null;
    },
    async list(status) {
      const rows = (
        status
          ? db
              .prepare(
                `SELECT ${SELECT_COLS} FROM registrations WHERE status = ? ORDER BY registered_at ASC`
              )
              .all(status)
          : db.prepare(`SELECT ${SELECT_COLS} FROM registrations ORDER BY registered_at ASC`).all()
      ) as Parameters<typeof mapRow>[0][];
      return rows.map(mapRow);
    },
    async setStatus(twitterUserId, status) {
      const reviewedAt = new Date().toISOString();
      db.prepare(
        `UPDATE registrations SET status = ?, reviewed_at = ? WHERE twitter_user_id = ?`
      ).run(status, reviewedAt, twitterUserId);
      return this.get(twitterUserId);
    },
  };
}

function createPostgresStore(url: string): Store {
  const sql = postgres(url, { max: 4 });

  const ready = (async () => {
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS registrations (
        twitter_user_id TEXT PRIMARY KEY,
        twitter_handle TEXT NOT NULL,
        wallet_address TEXT,
        liked BOOLEAN NOT NULL DEFAULT FALSE,
        retweeted BOOLEAN NOT NULL DEFAULT FALSE,
        registered_at TIMESTAMPTZ NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        reviewed_at TIMESTAMPTZ
      )
    `);
    await sql.unsafe(`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'`);
    await sql.unsafe(`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ`);
  })();

  return {
    async upsert(entry) {
      await ready;
      await sql`
        INSERT INTO registrations
          (twitter_user_id, twitter_handle, wallet_address, liked, retweeted, registered_at, status, reviewed_at)
        VALUES (
          ${entry.twitterUserId},
          ${entry.twitterHandle},
          ${entry.walletAddress},
          ${entry.liked},
          ${entry.retweeted},
          ${entry.submittedAt},
          'pending',
          NULL
        )
        ON CONFLICT (twitter_user_id) DO UPDATE SET
          twitter_handle = EXCLUDED.twitter_handle,
          wallet_address = EXCLUDED.wallet_address,
          liked = EXCLUDED.liked,
          retweeted = EXCLUDED.retweeted,
          status = CASE
            WHEN registrations.wallet_address IS DISTINCT FROM EXCLUDED.wallet_address THEN 'pending'
            ELSE registrations.status
          END,
          reviewed_at = CASE
            WHEN registrations.wallet_address IS DISTINCT FROM EXCLUDED.wallet_address THEN NULL
            ELSE registrations.reviewed_at
          END
      `;
    },
    async get(twitterUserId) {
      await ready;
      const rows = await sql<Parameters<typeof mapRow>[0][]>`
        SELECT twitter_user_id, twitter_handle, wallet_address, liked, retweeted, registered_at, status, reviewed_at
        FROM registrations WHERE twitter_user_id = ${twitterUserId}
      `;
      return rows[0] ? mapRow(rows[0]) : null;
    },
    async getByHandle(handle) {
      await ready;
      const normalized = handle.replace(/^@/, "").toLowerCase();
      const rows = await sql<Parameters<typeof mapRow>[0][]>`
        SELECT twitter_user_id, twitter_handle, wallet_address, liked, retweeted, registered_at, status, reviewed_at
        FROM registrations
        WHERE lower(twitter_handle) = ${normalized}
        ORDER BY registered_at DESC
        LIMIT 1
      `;
      return rows[0] ? mapRow(rows[0]) : null;
    },
    async list(status) {
      await ready;
      const rows = status
        ? await sql<Parameters<typeof mapRow>[0][]>`
            SELECT twitter_user_id, twitter_handle, wallet_address, liked, retweeted, registered_at, status, reviewed_at
            FROM registrations WHERE status = ${status} ORDER BY registered_at ASC
          `
        : await sql<Parameters<typeof mapRow>[0][]>`
            SELECT twitter_user_id, twitter_handle, wallet_address, liked, retweeted, registered_at, status, reviewed_at
            FROM registrations ORDER BY registered_at ASC
          `;
      return rows.map(mapRow);
    },
    async setStatus(twitterUserId, status) {
      await ready;
      const reviewedAt = new Date().toISOString();
      await sql`
        UPDATE registrations
        SET status = ${status}, reviewed_at = ${reviewedAt}
        WHERE twitter_user_id = ${twitterUserId}
      `;
      return this.get(twitterUserId);
    },
  };
}

let store: Store | null = null;

function getStore(): Store {
  if (store) return store;
  const url = getDatabaseUrl();
  if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
    store = createPostgresStore(url);
  } else {
    store = createSqliteStore(sqlitePath(url));
  }
  return store;
}

export async function upsertRegistration(
  entry: Omit<Registration, "status" | "reviewedAt">
): Promise<void> {
  await getStore().upsert(entry);
}

export async function getRegistration(
  twitterUserId: string
): Promise<Registration | null> {
  return getStore().get(twitterUserId);
}

export async function getRegistrationByHandle(
  handle: string
): Promise<Registration | null> {
  return getStore().getByHandle(handle);
}

export function databaseDialect(): "postgres" | "sqlite" {
  const url = getDatabaseUrl();
  if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
    return "postgres";
  }
  return "sqlite";
}

export function databasePersists(): boolean {
  return databaseDialect() === "postgres";
}

export async function listRegistrations(
  status?: ApplicationStatus
): Promise<Registration[]> {
  return getStore().list(status);
}

export async function setRegistrationStatus(
  twitterUserId: string,
  status: ApplicationStatus
): Promise<Registration | null> {
  return getStore().setStatus(twitterUserId, status);
}
