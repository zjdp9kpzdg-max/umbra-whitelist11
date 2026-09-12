import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getSession();
  session.destroy();
  if (request.headers.get("accept")?.includes("text/html")) {
    return NextResponse.redirect(new URL("/", new URL(request.url).origin));
  }
  return NextResponse.json({ ok: true });
}
