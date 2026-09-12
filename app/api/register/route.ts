import { NextResponse } from "next/server";
import { upsertRegistration } from "@/lib/db";
import { isBearerEnabled, isOauthEnabled } from "@/lib/env";
import { honorUserId, normalizeHandle } from "@/lib/handle";
import { publicState } from "@/lib/public-state";
import { getSession, isConnected } from "@/lib/session";
import {
  refreshTwitterToken,
  verifyEngagement,
  verifyEngagementAppOnly,
} from "@/lib/twitter";
import { normalizeWallet } from "@/lib/wallet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function confirmOauthEngagement(
  session: Awaited<ReturnType<typeof getSession>>
) {
  if (!session.twitterUserId) {
    throw new Error("Connect X before registration.");
  }

  try {
    return await verifyEngagement(session.accessToken, session.twitterUserId);
  } catch (err) {
    if (err instanceof Error && err.name === "TwitterUnauthorized" && session.refreshToken) {
      const token = await refreshTwitterToken(session.refreshToken);
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      return verifyEngagement(token.accessToken, session.twitterUserId);
    }
    throw err;
  }
}

type Body = {
  wallet?: string;
  handle?: string;
  liked?: boolean;
  retweeted?: boolean;
  followed?: boolean;
};

export async function POST(request: Request) {
  let body: Body = {};
  try {
    body = (await request.json()) as Body;
  } catch {
    body = {};
  }

  const wallet = normalizeWallet(body.wallet, { required: true });
  if (!wallet.ok) {
    return NextResponse.json({ error: wallet.error }, { status: 400 });
  }
  if (!wallet.address) {
    return NextResponse.json(
      { error: "An ETH wallet is required to petition." },
      { status: 400 }
    );
  }

  const session = await getSession();
  const submittedAt = new Date().toISOString();

  if (isOauthEnabled()) {
    if (!isConnected(session) || !session.twitterUserId || !session.twitterHandle) {
      return NextResponse.json(
        { error: "Connect X before registration." },
        { status: 401 }
      );
    }

    try {
      const engagement = await confirmOauthEngagement(session);
      // Trust a prior successful verify in-session — liked_tweets pagination can flake on re-check.
      const liked = Boolean(engagement.liked || session.liked);
      const retweeted = Boolean(engagement.retweeted || session.retweeted);
      const followUnsupported = Boolean(
        engagement.followUnsupported || session.followUnsupported
      );
      const followedOk =
        Boolean(engagement.followed) ||
        (followUnsupported && Boolean(body.followed));
      if (!liked || !retweeted || !followedOk) {
        session.liked = liked;
        session.retweeted = retweeted;
        session.followed = Boolean(engagement.followed);
        session.followUnsupported = followUnsupported;
        await session.save();
        const missing: string[] = [];
        if (!followedOk) missing.push("follow");
        if (!liked) missing.push("like");
        if (!retweeted) missing.push("retweet");
        const detail =
          followUnsupported && !followedOk
            ? "Mark that you follow @UMBRAStudio11, then Seal again."
            : `Still missing: ${missing.join(", ")}. Verify again, then Seal.`;
        return NextResponse.json(
          {
            error: detail,
            liked,
            retweeted,
            followed: Boolean(engagement.followed),
            followUnsupported,
          },
          { status: 403 }
        );
      }

      await upsertRegistration({
        twitterUserId: session.twitterUserId,
        twitterHandle: session.twitterHandle,
        walletAddress: wallet.address,
        liked: true,
        retweeted: true,
        submittedAt,
      });

      session.liked = true;
      session.retweeted = true;
      session.followed = true;
      session.likeUnsupported = false;
      session.followUnsupported = false;
      session.registered = true;
      session.walletAddress = wallet.address;
      await session.save();

      return NextResponse.json(await publicState(session));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed.";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }

  if (isBearerEnabled()) {
    const handle = normalizeHandle(body.handle || session.twitterHandle);
    if (!handle.ok) {
      return NextResponse.json({ error: handle.error }, { status: 400 });
    }

    try {
      const engagement = await verifyEngagementAppOnly(handle.handle);
      if (!engagement.retweeted) {
        session.twitterUserId = engagement.userId;
        session.twitterHandle = engagement.handle;
        session.liked = engagement.liked;
        session.retweeted = false;
        session.followed = engagement.followed;
        session.likeUnsupported = Boolean(engagement.likeUnsupported);
        session.followUnsupported = Boolean(engagement.followUnsupported);
        await session.save();
        return NextResponse.json(
          {
            error: "Retweet the quest post, then verify again.",
            liked: engagement.liked,
            retweeted: false,
            followed: engagement.followed,
            likeUnsupported: engagement.likeUnsupported,
            followUnsupported: engagement.followUnsupported,
          },
          { status: 403 }
        );
      }

      const liked =
        engagement.liked || (Boolean(engagement.likeUnsupported) && Boolean(body.liked));
      if (!liked) {
        session.twitterUserId = engagement.userId;
        session.twitterHandle = engagement.handle;
        session.liked = engagement.liked;
        session.retweeted = true;
        session.followed = engagement.followed;
        session.likeUnsupported = Boolean(engagement.likeUnsupported);
        session.followUnsupported = Boolean(engagement.followUnsupported);
        await session.save();
        return NextResponse.json(
          {
            error: engagement.likeUnsupported
              ? "X does not allow app-only like reads. Mark that you liked the post."
              : "Like the quest post, then verify again.",
            liked: engagement.liked,
            retweeted: true,
            followed: engagement.followed,
            likeUnsupported: engagement.likeUnsupported,
            followUnsupported: engagement.followUnsupported,
          },
          { status: 403 }
        );
      }

      const followed =
        engagement.followed ||
        (Boolean(engagement.followUnsupported) && Boolean(body.followed));
      if (!followed) {
        session.twitterUserId = engagement.userId;
        session.twitterHandle = engagement.handle;
        session.liked = true;
        session.retweeted = true;
        session.followed = engagement.followed;
        session.likeUnsupported = Boolean(engagement.likeUnsupported);
        session.followUnsupported = Boolean(engagement.followUnsupported);
        await session.save();
        return NextResponse.json(
          {
            error: engagement.followUnsupported
              ? "Mark that you follow @UMBRAStudio11."
              : "Follow @UMBRAStudio11, then verify again.",
            liked: true,
            retweeted: true,
            followed: engagement.followed,
            likeUnsupported: engagement.likeUnsupported,
            followUnsupported: engagement.followUnsupported,
          },
          { status: 403 }
        );
      }

      await upsertRegistration({
        twitterUserId: engagement.userId,
        twitterHandle: engagement.handle,
        walletAddress: wallet.address,
        liked: true,
        retweeted: true,
        submittedAt,
      });

      session.twitterUserId = engagement.userId;
      session.twitterHandle = engagement.handle;
      session.liked = true;
      session.retweeted = true;
      session.followed = true;
      session.likeUnsupported = Boolean(engagement.likeUnsupported);
      session.followUnsupported = Boolean(engagement.followUnsupported);
      session.registered = true;
      session.walletAddress = wallet.address;
      await session.save();

      return NextResponse.json(await publicState(session));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed.";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }

  const handle = normalizeHandle(body.handle);
  if (!handle.ok) {
    return NextResponse.json({ error: handle.error }, { status: 400 });
  }
  if (!body.liked || !body.retweeted || !body.followed) {
    return NextResponse.json(
      { error: "Follow @UMBRAStudio11, like and retweet the quest post, then mark all complete." },
      { status: 403 }
    );
  }

  const userId = honorUserId(handle.handle);
  await upsertRegistration({
    twitterUserId: userId,
    twitterHandle: handle.handle,
    walletAddress: wallet.address,
    liked: true,
    retweeted: true,
    submittedAt,
  });

  session.twitterUserId = userId;
  session.twitterHandle = handle.handle;
  session.liked = true;
  session.retweeted = true;
  session.followed = true;
  session.likeUnsupported = false;
  session.followUnsupported = false;
  session.registered = true;
  session.walletAddress = wallet.address;
  await session.save();

  return NextResponse.json(await publicState(session));
}
