import { NextResponse } from "next/server";
import { isBearerEnabled, isOauthEnabled } from "@/lib/env";
import { normalizeHandle } from "@/lib/handle";
import { publicState } from "@/lib/public-state";
import { getSession, isConnected } from "@/lib/session";
import {
  refreshTwitterToken,
  verifyEngagement,
  verifyEngagementAppOnly,
} from "@/lib/twitter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function verifyWithOauth(session: Awaited<ReturnType<typeof getSession>>) {
  if (!isConnected(session) || !session.twitterUserId) {
    return NextResponse.json(
      { error: "Connect X before verification." },
      { status: 401 }
    );
  }

  try {
    const result = await verifyEngagement(session.accessToken, session.twitterUserId);
    session.liked = result.liked;
    session.retweeted = result.retweeted;
    session.likeUnsupported = false;
    await session.save();
    return NextResponse.json({
      ...(await publicState(session)),
      liked: result.liked,
      retweeted: result.retweeted,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "TwitterUnauthorized" && session.refreshToken) {
      try {
        const token = await refreshTwitterToken(session.refreshToken);
        session.accessToken = token.accessToken;
        session.refreshToken = token.refreshToken;
        const result = await verifyEngagement(token.accessToken, session.twitterUserId);
        session.liked = result.liked;
        session.retweeted = result.retweeted;
        session.likeUnsupported = false;
        await session.save();
        return NextResponse.json({
          ...(await publicState(session)),
          liked: result.liked,
          retweeted: result.retweeted,
        });
      } catch (refreshErr) {
        const message =
          refreshErr instanceof Error
            ? refreshErr.message
            : "X session expired. Connect again.";
        return NextResponse.json({ error: message }, { status: 401 });
      }
    }

    const message = err instanceof Error ? err.message : "Verification failed.";
    const status = message.includes("TARGET_TWEET_ID") ? 503 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}

async function verifyWithBearer(
  session: Awaited<ReturnType<typeof getSession>>,
  rawHandle: string | undefined
) {
  const parsed = normalizeHandle(rawHandle || session.twitterHandle);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const result = await verifyEngagementAppOnly(parsed.handle);
    session.twitterUserId = result.userId;
    session.twitterHandle = result.handle;
    session.liked = result.liked;
    session.retweeted = result.retweeted;
    session.likeUnsupported = Boolean(result.likeUnsupported);
    await session.save();

    if (!result.liked || !result.retweeted) {
      const missing = [
        !result.liked && !result.likeUnsupported ? "like" : null,
        !result.retweeted ? "retweet" : null,
      ].filter(Boolean);
      return NextResponse.json({
        ...(await publicState(session)),
        liked: result.liked,
        retweeted: result.retweeted,
        likeUnsupported: result.likeUnsupported,
        error:
          missing.length > 0
            ? `The ${missing.join(" and ")} ${missing.length === 1 ? "is" : "are"} not on the quest post yet.`
            : result.likeUnsupported
              ? "Retweet checked. X does not allow app-only like reads — mark the like box."
              : undefined,
      });
    }

    return NextResponse.json(await publicState(session));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Verification failed.";
    const status = message.includes("TARGET_TWEET_ID") ? 503 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}

async function runVerify(request: Request) {
  let handle: string | undefined;
  if (request.method === "POST") {
    try {
      const body = (await request.json()) as { handle?: string };
      handle = body.handle;
    } catch {
      handle = undefined;
    }
  }

  const session = await getSession();

  if (isOauthEnabled() && isConnected(session)) {
    return verifyWithOauth(session);
  }
  if (isBearerEnabled()) {
    return verifyWithBearer(session, handle);
  }
  if (isOauthEnabled()) {
    return NextResponse.json(
      { error: "Connect X before verification." },
      { status: 401 }
    );
  }

  return NextResponse.json(
    { error: "Sign in with X is not configured. Mark the post, then enter the list." },
    { status: 503 }
  );
}

export async function POST(request: Request) {
  return runVerify(request);
}

export async function GET(request: Request) {
  return runVerify(request);
}
