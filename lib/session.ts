import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { getSessionSecret } from "@/lib/env";

export type SessionData = {
  twitterUserId?: string;
  twitterHandle?: string;
  twitterName?: string;
  accessToken?: string;
  refreshToken?: string;
  liked?: boolean;
  retweeted?: boolean;
  followed?: boolean;
  followUnsupported?: boolean;
  registered?: boolean;
  walletAddress?: string;
  likeUnsupported?: boolean;
  oauthState?: string;
  codeVerifier?: string;
  oauthReturnPath?: string;
};

function options(): SessionOptions {
  return {
    password: getSessionSecret(),
    cookieName: "umbra_session",
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  };
}

export async function getSession() {
  const store = await cookies();
  return getIronSession<SessionData>(store, options());
}

export function isConnected(session: SessionData): boolean {
  return Boolean(session.twitterUserId && session.twitterHandle);
}
