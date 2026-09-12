import { NextResponse } from "next/server";
import { getRegistrationByHandle } from "@/lib/db";
import { normalizeHandle } from "@/lib/handle";
import type { ApplicationStatus } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type StatusLookup = {
  found: boolean;
  handle: string | null;
  submitted: boolean;
  status: ApplicationStatus | null;
  /** Truncated wallet only — never full address on public lookup. */
  walletHint: string | null;
};

function walletHint(address: string | null): string | null {
  if (!address || address.length < 10) return null;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export async function POST(request: Request) {
  let body: { handle?: string } = {};
  try {
    body = (await request.json()) as { handle?: string };
  } catch {
    body = {};
  }

  const parsed = normalizeHandle(body.handle);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const record = await getRegistrationByHandle(parsed.handle);
  if (!record) {
    const payload: StatusLookup = {
      found: false,
      handle: parsed.handle,
      submitted: false,
      status: null,
      walletHint: null,
    };
    return NextResponse.json(payload);
  }

  const payload: StatusLookup = {
    found: true,
    handle: record.twitterHandle,
    submitted: true,
    status: record.status,
    walletHint: walletHint(record.walletAddress),
  };
  return NextResponse.json(payload);
}
