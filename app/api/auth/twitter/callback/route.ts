import { NextResponse } from "next/server";
import { getRegistration } from "@/lib/db";
import { getSession } from "@/lib/session";
import { exchangeTwitterCode, getTwitterMe } from "@/lib/twitter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function redirectHome(request: Request, query: string) {
  return NextResponse.redirect(new URL(`/${query}`, new URL(request.url).origin));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const session = await getSession();

  if (error) {
    session.oauthState = undefined;
    session.codeVerifier = undefined;
    await session.save();
    return redirectHome(request, `?error=${encodeURIComponent("X declined the connection.")}`);
  }

  if (!code || !state || !session.oauthState || !session.codeVerifier) {
    return redirectHome(request, "?error=Missing%20OAuth%20state.%20Connect%20again.");
  }

  if (state !== session.oauthState) {
    session.oauthState = undefined;
    session.codeVerifier = undefined;
    await session.save();
    return redirectHome(request, "?error=OAuth%20state%20mismatch.%20Connect%20again.");
  }

  try {
    const token = await exchangeTwitterCode(code, session.codeVerifier);
    const profile = await getTwitterMe(token.accessToken);
    const existing = await getRegistration(profile.id);

    session.twitterUserId = profile.id;
    session.twitterHandle = profile.username;
    session.twitterName = profile.name;
    session.accessToken = token.accessToken;
    session.refreshToken = token.refreshToken;
    session.liked = existing?.liked ?? false;
    session.retweeted = existing?.retweeted ?? false;
    session.registered = Boolean(existing);
    session.walletAddress = existing?.walletAddress ?? undefined;
    session.oauthState = undefined;
    session.codeVerifier = undefined;
    await session.save();

    return redirectHome(request, "?connected=1");
  } catch (err) {
    session.oauthState = undefined;
    session.codeVerifier = undefined;
    await session.save();
    const message =
      err instanceof Error ? err.message : "X authorization failed.";
    return redirectHome(request, `?error=${encodeURIComponent(message)}`);
  }
}
