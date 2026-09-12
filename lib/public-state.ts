import { getRegistration } from "@/lib/db";
import {
  getTargetTweetId,
  isBearerEnabled,
  isOauthEnabled,
  tweetLikeUrl,
  tweetRetweetUrl,
  tweetUrl,
} from "@/lib/env";
import { isConnected, type SessionData } from "@/lib/session";
import type { PublicState } from "@/lib/types";

export type { PublicState };

export async function publicState(session: SessionData): Promise<PublicState> {
  const connected = isConnected(session);
  const record = session.twitterUserId
    ? await getRegistration(session.twitterUserId)
    : null;
  const targetTweetId = getTargetTweetId() || null;

  return {
    oauthEnabled: isOauthEnabled(),
    bearerEnabled: isBearerEnabled(),
    connected,
    handle: session.twitterHandle ?? null,
    userId: session.twitterUserId ?? null,
    name: session.twitterName ?? null,
    liked: Boolean(session.liked || record?.liked),
    retweeted: Boolean(session.retweeted || record?.retweeted),
    likeUnsupported: Boolean(session.likeUnsupported),
    submitted: Boolean(session.registered || record),
    status: record?.status ?? (session.registered ? "pending" : null),
    walletAddress: session.walletAddress ?? record?.walletAddress ?? null,
    targetTweetId,
    tweetUrl: tweetUrl(targetTweetId ?? undefined),
    likeUrl: tweetLikeUrl(targetTweetId ?? undefined),
    retweetUrl: tweetRetweetUrl(targetTweetId ?? undefined),
  };
}
