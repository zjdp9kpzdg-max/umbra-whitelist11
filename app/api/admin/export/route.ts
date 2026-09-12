import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin";
import { registrationsToCsv } from "@/lib/csv";
import { listRegistrations, parseStatus } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = assertAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const status = parseStatus(new URL(request.url).searchParams.get("status"));
  const rows = await listRegistrations(status ?? undefined);
  const csv = registrationsToCsv(rows);
  const stamp = new Date().toISOString().slice(0, 10);
  const suffix = status ?? "all";

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="umbra-petitions-${suffix}-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
