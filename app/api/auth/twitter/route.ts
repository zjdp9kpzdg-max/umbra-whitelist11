import { NextResponse } from "next/server";
import { isOauthEnabled } from "@/lib/env";
import { pkceChallenge, pkceVerifier, randomToken } from "@/lib/oauth";
import { getSession } from "@/lib/session";
import { buildTwitterAuthUrl } from "@/lib/twitter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function homeUrl(request: Request, query?: string): URL {
  const url = new URL(request.url);
  return new URL(query ? `/${query}` : "/", url.origin);
}

export async function GET(request: Request) {
  if (!isOauthEnabled()) {
    return NextResponse.redirect(
      homeUrl(
        request,
        "?error=Sign%20in%20with%20X%20is%20not%20configured%20on%20this%20host."
      )
    );
  }

  const session = await getSession();
  const state = randomToken(16);
  const verifier = pkceVerifier();
  session.oauthState = state;
  session.codeVerifier = verifier;
  await session.save();

  return NextResponse.redirect(buildTwitterAuthUrl(state, pkceChallenge(verifier)));
}
