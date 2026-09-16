import { NextResponse } from "next/server";
import { getRegistration, getRegistrationByHandle } from "@/lib/db";
import { getSession } from "@/lib/session";
import { exchangeTwitterCode, getTwitterMe } from "@/lib/twitter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_NEXT = new Set(["/", "/status", "/whitelist"]);

function safeReturn(path: string | undefined): string {
  if (!path) return "/";
  const clean = path.split("?")[0];
  return ALLOWED_NEXT.has(clean) ? clean : "/";
}

function redirectTo(request: Request, path: string, query: string) {
  const q = query.startsWith("?") || query === "" ? query : `?${query}`;
  const target = path === "/" ? `/${q}` : `${path}${q}`;
  return NextResponse.redirect(new URL(target, new URL(request.url).origin));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const session = await getSession();
  const returnPath = safeReturn(session.oauthReturnPath);

  if (error) {
    session.oauthState = undefined;
    session.codeVerifier = undefined;
    session.oauthReturnPath = undefined;
    await session.save();
    return redirectTo(request, returnPath, `?error=${encodeURIComponent("X declined the connection.")}`);
  }

  if (!code || !state || !session.oauthState || !session.codeVerifier) {
    return redirectTo(request, returnPath, "?error=Missing%20OAuth%20state.%20Connect%20again.");
  }

  if (state !== session.oauthState) {
    session.oauthState = undefined;
    session.codeVerifier = undefined;
    session.oauthReturnPath = undefined;
    await session.save();
    return redirectTo(request, returnPath, "?error=OAuth%20state%20mismatch.%20Connect%20again.");
  }

  try {
    const token = await exchangeTwitterCode(code, session.codeVerifier);
    const profile = await getTwitterMe(token.accessToken);
    let existing = await getRegistration(profile.id);
    if (!existing) {
      existing = await getRegistrationByHandle(profile.username);
    }

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
    session.oauthReturnPath = undefined;
    await session.save();

    return redirectTo(request, returnPath, "?connected=1");
  } catch (err) {
    session.oauthState = undefined;
    session.codeVerifier = undefined;
    session.oauthReturnPath = undefined;
    await session.save();
    const message =
      err instanceof Error ? err.message : "X authorization failed.";
    return redirectTo(request, returnPath, `?error=${encodeURIComponent(message)}`);
  }
}
