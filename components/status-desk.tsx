"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { UMBRA_X_HANDLE, WHITELIST_ENABLED } from "@/lib/brand";
import type { ApplicationStatus } from "@/lib/db";
import type { PublicState } from "@/lib/types";

const empty: PublicState = {
  oauthEnabled: false,
  bearerEnabled: false,
  connected: false,
  handle: null,
  userId: null,
  name: null,
  liked: false,
  retweeted: false,
  followed: false,
  likeUnsupported: false,
  followUnsupported: false,
  followUrl: "https://x.com/intent/follow?screen_name=UMBRAStudio11",
  submitted: false,
  status: null,
  walletAddress: null,
  targetTweetId: null,
  tweetUrl: null,
  likeUrl: null,
  retweetUrl: null,
};

type ViewState = {
  connected: boolean;
  lookedUp: boolean;
  handle: string | null;
  submitted: boolean;
  status: ApplicationStatus | null;
  walletLine: string | null;
};

function statusCopy(view: ViewState) {
  if (!view.connected && !view.lookedUp) {
    return {
      badge: "closed",
      title: "connect x — or leave the handle.",
      body: "connect x to check, or type the handle you petitioned with. under review, or on the list.",
    };
  }
  if (!view.submitted) {
    return {
      badge: "empty",
      title: "no petition on file.",
      body: view.handle
        ? `nothing for @${view.handle}. send one if you actually want in. not automatic.`
        : "send a petition if you actually want in. not automatic.",
    };
  }
  if (view.status === "approved") {
    return {
      badge: "on the list",
      title: "you're on the list.",
      body: "name's marked. still not a promise. watch the account.",
    };
  }
  if (view.status === "rejected") {
    return {
      badge: "closed",
      title: "not this time.",
      body: "got the petition. doesn't mean we owe you a speech.",
    };
  }
  return {
    badge: "under review",
    title: "under review.",
    body: "it's in. not a promise. check back whenever.",
  };
}

export function StatusDesk() {
  const [session, setSession] = useState<PublicState>(empty);
  const [busy, setBusy] = useState(false);
  const [lookupBusy, setLookupBusy] = useState(false);
  const [handleInput, setHandleInput] = useState("");
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookup, setLookup] = useState<{
    lookedUp: boolean;
    handle: string | null;
    submitted: boolean;
    status: ApplicationStatus | null;
    walletHint: string | null;
  }>({
    lookedUp: false,
    handle: null,
    submitted: false,
    status: null,
    walletHint: null,
  });

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch("/api/session", { cache: "no-store" });
        const data = (await res.json()) as PublicState;
        if (alive) setSession({ ...empty, ...data });
      } catch {
        /* lookup form stays up even if session is quiet */
      }
    }
    load();
    const timer = window.setInterval(load, 15000);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, []);

  async function logout() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" });
    setSession((prev) => ({
      ...prev,
      connected: false,
      handle: null,
      userId: null,
      name: null,
      submitted: false,
      status: null,
      walletAddress: null,
      liked: false,
      retweeted: false,
    }));
    setBusy(false);
  }

  async function lookupHandle() {
    setLookupBusy(true);
    setLookupError(null);
    try {
      const res = await fetch("/api/status/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: handleInput }),
      });
      const data = (await res.json()) as {
        error?: string;
        found?: boolean;
        handle?: string | null;
        submitted?: boolean;
        status?: ApplicationStatus | null;
        walletHint?: string | null;
      };
      if (!res.ok) throw new Error(data.error || "couldn't load.");
      setLookup({
        lookedUp: true,
        handle: data.handle ?? null,
        submitted: Boolean(data.submitted),
        status: data.status ?? null,
        walletHint: data.walletHint ?? null,
      });
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : "couldn't load.");
    } finally {
      setLookupBusy(false);
    }
  }

  // Session (Connect X) wins when connected; otherwise use handle lookup.
  const view: ViewState = session.connected
    ? {
        connected: true,
        lookedUp: false,
        handle: session.handle,
        submitted: session.submitted,
        status: session.status,
        walletLine: session.walletAddress,
      }
    : {
        connected: false,
        lookedUp: lookup.lookedUp,
        handle: lookup.handle,
        submitted: lookup.submitted,
        status: lookup.status,
        walletLine: lookup.walletHint,
      };

  const copy = statusCopy(view);
  const badgeTone =
    view.status === "approved"
      ? "border-[#1F6B4A] bg-[#1F6B4A] text-[#E8E0D4]"
      : view.status === "rejected"
        ? "border-[#8F3A32] bg-[#8F3A32]/20 text-[#E8C4BC]"
        : "border-[#C9A227]/50 bg-[#C9A227]/10 text-[#C9A227]";

  const showLookupForm = !session.connected;

  return (
    <div className="relative z-50 flex min-h-full flex-1 flex-col">
      <SiteNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-5 pb-16 sm:px-8">
        <p className="font-mono text-[11px] tracking-[0.22em] text-[#C9A227]">
          status
        </p>
        <h1 className="font-mono mt-4 text-3xl text-[#E8E0D4]">
          check the list.
        </h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-[#E8E0D4]/60">
          signal. 1,111 heads. connect x, or type the handle you already used.
          under review, or on the list. nothing here is automatic.
        </p>

        <div className="mt-10 border border-[#C9A227]/25 bg-[#0C0C11]/80 p-6 sm:p-8">
            <Badge className={cn("rounded-none", badgeTone)}>{copy.badge}</Badge>
            <h2 className="font-mono mt-4 text-2xl text-[#E8E0D4]">{copy.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[#E8E0D4]/70">{copy.body}</p>
            {(view.connected || view.lookedUp) && view.handle && (
              <p className="mt-4 font-mono text-xs text-[#E8E0D4]/45">
                @{view.handle}
                {view.walletLine ? ` · ${view.walletLine}` : ""}
              </p>
            )}

            {showLookupForm && (
              <div className="mt-8 border-t border-[#C9A227]/15 pt-6">
                <p className="font-mono text-[11px] tracking-[0.22em] text-[#C9A227]">
                  or leave the handle
                </p>
                <Label htmlFor="status-handle" className="mt-2 text-sm font-normal text-[#E8E0D4]/70">
                  status only. if connect x won&apos;t open, type the handle from your petition. new ones still need the form.
                </Label>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Input
                    id="status-handle"
                    value={handleInput}
                    onChange={(e) => {
                      setHandleInput(e.target.value);
                      setLookupError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void lookupHandle();
                      }
                    }}
                    placeholder="@handle"
                    className="h-10 rounded-none border-[#C9A227]/30 bg-[#07070A] text-sm sm:max-w-xs"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <Button
                    className="h-10 rounded-none bg-[#C9A227] text-[#07070A] hover:bg-[#C9A227]/90"
                    onClick={lookupHandle}
                    disabled={lookupBusy || !handleInput.trim()}
                  >
                    {lookupBusy ? "checking…" : "check"}
                  </Button>
                </div>
                {lookupError && (
                  <p className="mt-2 text-xs text-[#C4A08A]">{lookupError}</p>
                )}
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              {!session.connected && session.oauthEnabled && (
                <a
                  href="/api/auth/twitter?next=/status"
                  className={cn(
                    buttonVariants(),
                    "rounded-none bg-[#C9A227] text-[#07070A] hover:bg-[#C9A227]/90"
                  )}
                >
                  Connect X
                </a>
              )}
              {session.connected && (
                <Button
                  variant="outline"
                  className="rounded-none border-[#C9A227]/40"
                  onClick={logout}
                  disabled={busy}
                >
                  Disconnect
                </Button>
              )}
              <Link
                href="/"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "rounded-none border-[#C9A227]/40"
                )}
              >
                {WHITELIST_ENABLED
                  ? view.submitted
                    ? "back to petition"
                    : "send a petition"
                  : "back"}
              </Link>
            </div>
            <p className="mt-6 text-xs text-[#E8E0D4]/40">
              watch @{UMBRA_X_HANDLE}.
            </p>
          </div>
      </main>
      <SiteFooter />
    </div>
  );
}
