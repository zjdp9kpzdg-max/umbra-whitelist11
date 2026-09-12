import { NextResponse } from "next/server";
import { publicState } from "@/lib/public-state";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  return NextResponse.json(await publicState(session));
}
