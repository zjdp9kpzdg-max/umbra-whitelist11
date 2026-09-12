import {
  getTargetTweetId,
  getTwitterBearerToken,
  getTwitterCallbackUrl,
  getTwitterClientId,
  getTwitterClientSecret,
} from "@/lib/env";

const AUTH_URL = "https://twitter.com/i/oauth2/authorize";
const TOKEN_URL = "https://api.twitter.com/2/oauth2/token";
const API = "https://api.twitter.com/2";
const SCOPES = ["tweet.read", "users.read", "like.read", "offline.access"];
const MAX_PAGES = 5;

export type TwitterToken = {
  accessToken: string;
  refreshToken?: string;
};

export type TwitterProfile = {
  id: string;
  username: string;
  name: string;
};

export function twitterScopes(): string {
  return SCOPES.join(" ");
}

export function buildTwitterAuthUrl(state: string, codeChallenge: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: getTwitterClientId(),
    redirect_uri: getTwitterCallbackUrl(),
    scope: twitterScopes(),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
  return `${AUTH_URL}?${params.toString()}`;
}

function basicAuth(): string {
  const raw = `${getTwitterClientId()}:${getTwitterClientSecret()}`;
  return `Basic ${Buffer.from(raw).toString("base64")}`;
}

async function readError(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const json = JSON.parse(text) as {
      error?: string;
      error_description?: string;
      detail?: string;
      title?: string;
    };
    return (
      json.error_description ||
      json.detail ||
      json.error ||
      json.title ||
      text ||
      `Twitter API ${res.status}`
    );
  } catch {
    return text || `Twitter API ${res.status}`;
  }
}

export async function exchangeTwitterCode(
  code: string,
  codeVerifier: string
): Promise<TwitterToken> {
  const body = new URLSearchParams({
    code,
    grant_type: "authorization_code",
    client_id: getTwitterClientId(),
    redirect_uri: getTwitterCallbackUrl(),
    code_verifier: codeVerifier,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: basicAuth(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!res.ok) {
    throw new Error(await readError(res));
  }

  const json = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
  };
  return { accessToken: json.access_token, refreshToken: json.refresh_token };
}

export async function refreshTwitterToken(
  refreshToken: string
): Promise<TwitterToken> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: getTwitterClientId(),
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: basicAuth(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!res.ok) {
    throw new Error(await readError(res));
  }

  const json = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
  };
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token ?? refreshToken,
  };
}

async function twitterGet<T>(
  path: string,
  accessToken: string,
  params?: Record<string, string>
): Promise<T> {
  const url = new URL(`${API}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (res.status === 401) {
    const err = new Error("Twitter session expired.");
    err.name = "TwitterUnauthorized";
    throw err;
  }

  if (!res.ok) {
    const message = await readError(res);
    if (
      res.status === 403 &&
      /application-only is forbidden|unsupported authentication/i.test(message)
    ) {
      const err = new Error(
        "This X endpoint does not accept an app-only bearer token."
      );
      err.name = "TwitterAppOnlyForbidden";
      throw err;
    }
    throw new Error(message);
  }

  return (await res.json()) as T;
}

export async function getTwitterMe(accessToken: string): Promise<TwitterProfile> {
  const json = await twitterGet<{
    data: { id: string; username: string; name: string };
  }>("/users/me", accessToken, { "user.fields": "id,username,name" });
  return json.data;
}

type Page<T> = {
  data?: T[];
  meta?: { next_token?: string; result_count?: number };
};

async function paginate<T>(
  path: string,
  accessToken: string,
  params: Record<string, string>,
  match: (items: T[]) => boolean
): Promise<boolean> {
  let paginationToken: string | undefined;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const query = { ...params };
    if (paginationToken) query.pagination_token = paginationToken;
    const json = await twitterGet<Page<T>>(path, accessToken, query);
    const items = json.data ?? [];
    if (match(items)) return true;
    paginationToken = json.meta?.next_token;
    if (!paginationToken) break;
  }

  return false;
}

export async function hasLikedTweet(
  accessToken: string,
  userId: string,
  tweetId: string
): Promise<boolean> {
  return paginate<{ id: string }>(
    `/users/${userId}/liked_tweets`,
    accessToken,
    { max_results: "100", "tweet.fields": "id" },
    (items) => items.some((tweet) => tweet.id === tweetId)
  );
}

export async function hasRetweetedTweet(
  accessToken: string,
  userId: string,
  tweetId: string
): Promise<boolean> {
  const onList = await paginate<{ id: string }>(
    `/tweets/${tweetId}/retweeted_by`,
    accessToken,
    { max_results: "100", "user.fields": "id" },
    (items) => items.some((user) => user.id === userId)
  );
  if (onList) return true;

  return paginate<{
    id: string;
    referenced_tweets?: { type: string; id: string }[];
  }>(
    `/users/${userId}/tweets`,
    accessToken,
    { max_results: "100", "tweet.fields": "referenced_tweets" },
    (items) =>
      items.some((tweet) =>
        tweet.referenced_tweets?.some(
          (ref) => ref.type === "retweeted" && ref.id === tweetId
        )
      )
  );
}

export type Engagement = {
  liked: boolean;
  retweeted: boolean;
  likeUnsupported?: boolean;
  userId?: string;
  handle?: string;
};

export async function verifyEngagement(
  accessToken: string | undefined,
  userId: string
): Promise<Engagement> {
  const tweetId = getTargetTweetId();
  if (!tweetId) {
    throw new Error("TARGET_TWEET_ID is not configured.");
  }
  if (!accessToken) {
    throw new Error("X session is missing an access token. Connect again.");
  }

  const [liked, retweeted] = await Promise.all([
    hasLikedTweet(accessToken, userId, tweetId),
    hasRetweetedTweet(accessToken, userId, tweetId),
  ]);

  return { liked, retweeted };
}

export async function lookupUserByHandle(
  handle: string,
  accessToken: string
): Promise<TwitterProfile> {
  const json = await twitterGet<{
    data: { id: string; username: string; name: string };
  }>(`/users/by/username/${encodeURIComponent(handle)}`, accessToken, {
    "user.fields": "id,username,name",
  });
  if (!json.data) {
    throw new Error("That X handle was not found.");
  }
  return json.data;
}

async function hasLikedViaLikingUsers(
  accessToken: string,
  userId: string,
  tweetId: string
): Promise<boolean> {
  return paginate<{ id: string }>(
    `/tweets/${tweetId}/liking_users`,
    accessToken,
    { max_results: "100", "user.fields": "id" },
    (items) => items.some((user) => user.id === userId)
  );
}

async function hasRetweetedViaList(
  accessToken: string,
  userId: string,
  tweetId: string
): Promise<boolean> {
  return paginate<{ id: string }>(
    `/tweets/${tweetId}/retweeted_by`,
    accessToken,
    { max_results: "100", "user.fields": "id" },
    (items) => items.some((user) => user.id === userId)
  );
}

export async function verifyEngagementAppOnly(
  handle: string
): Promise<Engagement & { userId: string; handle: string }> {
  const bearer = getTwitterBearerToken();
  if (!bearer) {
    throw new Error("TWITTER_BEARER_TOKEN is not configured.");
  }
  const tweetId = getTargetTweetId();
  if (!tweetId) {
    throw new Error("TARGET_TWEET_ID is not configured.");
  }

  const profile = await lookupUserByHandle(handle, bearer);
  const retweeted = await hasRetweetedViaList(bearer, profile.id, tweetId);

  try {
    const liked = await hasLikedViaLikingUsers(bearer, profile.id, tweetId);
    return {
      liked,
      retweeted,
      likeUnsupported: false,
      userId: profile.id,
      handle: profile.username,
    };
  } catch (err) {
    if (err instanceof Error && err.name === "TwitterAppOnlyForbidden") {
      return {
        liked: false,
        retweeted,
        likeUnsupported: true,
        userId: profile.id,
        handle: profile.username,
      };
    }
    throw err;
  }
}
