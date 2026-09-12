import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin";
import {
  databaseDialect,
  databasePersists,
  listRegistrations,
  parseStatus,
  setRegistrationStatus,
} from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = assertAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const status = parseStatus(new URL(request.url).searchParams.get("status"));
  const rows = await listRegistrations(status ?? undefined);
  return NextResponse.json({
    count: rows.length,
    submissions: rows,
    database: databaseDialect(),
    persists: databasePersists(),
  });
}

export async function POST(request: Request) {
  const auth = assertAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: { twitterUserId?: string; status?: string } = {};
  try {
    body = (await request.json()) as { twitterUserId?: string; status?: string };
  } catch {
    body = {};
  }

  const status = parseStatus(body.status);
  const twitterUserId = body.twitterUserId?.trim() ?? "";
  if (!twitterUserId || !status || status === "pending") {
    return NextResponse.json(
      { error: "Provide twitterUserId and status approved|rejected." },
      { status: 400 }
    );
  }

  const row = await setRegistrationStatus(twitterUserId, status);
  if (!row) {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  }
  return NextResponse.json(row);
}
