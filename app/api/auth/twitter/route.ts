import { NextResponse } from "next/server";
import { isOauthEnabled, isWhitelistEnabled } from "@/lib/env";
import { pkceChallenge, pkceVerifier, randomToken } from "@/lib/oauth";
import { getSession } from "@/lib/session";
import { buildTwitterAuthUrl } from "@/lib/twitter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_NEXT = new Set(["/", "/status", "/whitelist"]);

function safeNext(raw: string | null): string {
  if (!raw) return "/";
  const path = raw.split("?")[0];
  return ALLOWED_NEXT.has(path) ? path : "/";
}

function homeUrl(request: Request, query?: string): URL {
  const url = new URL(request.url);
  return new URL(query ? `/${query}` : "/", url.origin);
}

export async function GET(request: Request) {
  if (!isWhitelistEnabled()) {
    return NextResponse.redirect(homeUrl(request));
  }
  if (!isOauthEnabled()) {
    return NextResponse.redirect(
      homeUrl(
        request,
        "?error=Sign%20in%20with%20X%20is%20not%20configured%20on%20this%20host."
      )
    );
  }

  const session = await getSession();
  const next = safeNext(new URL(request.url).searchParams.get("next"));
  const state = randomToken(16);
  const verifier = pkceVerifier();
  session.oauthState = state;
  session.codeVerifier = verifier;
  session.oauthReturnPath = next;
  await session.save();

  return NextResponse.redirect(buildTwitterAuthUrl(state, pkceChallenge(verifier)));
}
