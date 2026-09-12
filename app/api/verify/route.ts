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
    session.followed = result.followed;
    session.likeUnsupported = false;
    session.followUnsupported = Boolean(result.followUnsupported);
    await session.save();
    return NextResponse.json({
      ...(await publicState(session)),
      liked: result.liked,
      retweeted: result.retweeted,
      followed: result.followed,
      followUnsupported: result.followUnsupported,
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
        session.followed = result.followed;
        session.likeUnsupported = false;
        session.followUnsupported = Boolean(result.followUnsupported);
        await session.save();
        return NextResponse.json({
          ...(await publicState(session)),
          liked: result.liked,
          retweeted: result.retweeted,
          followed: result.followed,
          followUnsupported: result.followUnsupported,
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
    session.followed = Boolean(result.followed);
    session.likeUnsupported = Boolean(result.likeUnsupported);
    session.followUnsupported = Boolean(result.followUnsupported);
    await session.save();

    if (!result.liked || !result.retweeted || !result.followed) {
      const missing = [
        !result.followed && !result.followUnsupported ? "follow" : null,
        !result.liked && !result.likeUnsupported ? "like" : null,
        !result.retweeted ? "retweet" : null,
      ].filter(Boolean);
      const attestHints = [
        result.followUnsupported && !result.followed ? "mark that you follow" : null,
        result.likeUnsupported && !result.liked ? "mark the like box" : null,
      ].filter(Boolean);
      return NextResponse.json({
        ...(await publicState(session)),
        liked: result.liked,
        retweeted: result.retweeted,
        followed: result.followed,
        likeUnsupported: result.likeUnsupported,
        followUnsupported: result.followUnsupported,
        error:
          missing.length > 0
            ? `The ${missing.join(" and ")} ${missing.length === 1 ? "is" : "are"} not confirmed yet.`
            : attestHints.length > 0
              ? `Checked what we can. Please ${attestHints.join(" and ")}.`
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
