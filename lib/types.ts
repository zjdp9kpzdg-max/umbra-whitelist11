import type { ApplicationStatus } from "@/lib/db";

export type PublicState = {
  oauthEnabled: boolean;
  bearerEnabled: boolean;
  connected: boolean;
  handle: string | null;
  userId: string | null;
  name: string | null;
  liked: boolean;
  retweeted: boolean;
  likeUnsupported: boolean;
  submitted: boolean;
  status: ApplicationStatus | null;
  walletAddress: string | null;
  targetTweetId: string | null;
  tweetUrl: string | null;
  likeUrl: string | null;
  retweetUrl: string | null;
};
