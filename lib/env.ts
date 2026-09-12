function read(name: string): string {
  // Dynamic lookup so a local `next build` cannot inline empty Twitter keys
  // into the serverless bundle. Vercel Production env is read at runtime.
  const env = process.env as Record<string, string | undefined>;
  return env[name]?.trim() ?? "";
}

export function getTwitterClientId(): string {
  return read("TWITTER_CLIENT_ID");
}

export function getTwitterClientSecret(): string {
  return read("TWITTER_CLIENT_SECRET");
}

export function getTwitterBearerToken(): string {
  return read("TWITTER_BEARER_TOKEN");
}

export function getTwitterCallbackUrl(): string {
  return (
    read("TWITTER_CALLBACK_URL") ||
    "http://127.0.0.1:43147/api/auth/twitter/callback"
  );
}

export function getTargetTweetId(): string {
  return read("TARGET_TWEET_ID");
}

export function getSessionSecret(): string {
  const secret = read("SESSION_SECRET");
  if (secret.length >= 32) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be at least 32 characters.");
  }
  return "umbra-local-dev-session-secret-32";
}

export function getDatabaseUrl(): string {
  return read("DATABASE_URL") || "file:./data/umbra.sqlite";
}

export function getAdminToken(): string {
  return read("ADMIN_TOKEN");
}

export function isOauthEnabled(): boolean {
  return Boolean(getTwitterClientId() && getTwitterClientSecret());
}

export function isBearerEnabled(): boolean {
  return Boolean(getTwitterBearerToken());
}

export function tweetUrl(tweetId = getTargetTweetId()): string | null {
  if (!tweetId) return null;
  return `https://x.com/i/web/status/${tweetId}`;
}

export function tweetLikeUrl(tweetId = getTargetTweetId()): string | null {
  if (!tweetId) return null;
  return `https://x.com/intent/like?tweet_id=${tweetId}`;
}

export function tweetRetweetUrl(tweetId = getTargetTweetId()): string | null {
  if (!tweetId) return null;
  return `https://x.com/intent/retweet?tweet_id=${tweetId}`;
}
