"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { UMBRA_X_HANDLE } from "@/lib/brand";
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
  likeUnsupported: false,
  submitted: false,
  status: null,
  walletAddress: null,
  targetTweetId: null,
  tweetUrl: null,
  likeUrl: null,
  retweetUrl: null,
};

function statusCopy(state: PublicState) {
  if (!state.connected) {
    return {
      badge: "Sealed",
      title: "Bind your X to read the ledger.",
      body: "Status is kept by the name you bind. Connect X to see if your petition waits, or if the door has opened.",
    };
  }
  if (!state.submitted) {
    return {
      badge: "Empty",
      title: "No petition on file.",
      body: `Bound as @${state.handle}. Leave a petition at the Index if you mean to be seen.`,
    };
  }
  if (state.status === "approved") {
    return {
      badge: "On the list",
      title: "You're on the list.",
      body: "The Order has marked this name. The door knows you. Watch the signal — selection still moves in silence.",
    };
  }
  if (state.status === "rejected") {
    return {
      badge: "Closed",
      title: "This door does not open.",
      body: "The petition was received and set aside. The Order does not explain every closed door.",
    };
  }
  return {
    badge: "Under review",
    title: "Under review.",
    body: "Your petition waits in the ledger. Selection is not guaranteed. The Order reviews in silence.",
  };
}

export function StatusDesk() {
  const [state, setState] = useState<PublicState>(empty);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/session", { cache: "no-store" });
        const data = (await res.json()) as PublicState;
        if (alive) setState({ ...empty, ...data });
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function logout() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" });
    setState((prev) => ({
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

  const copy = statusCopy(state);
  const badgeTone =
    state.status === "approved"
      ? "border-[#1F6B4A] bg-[#1F6B4A] text-[#E8E0D4]"
      : state.status === "rejected"
        ? "border-[#8F3A32] bg-[#8F3A32]/20 text-[#E8C4BC]"
        : "border-[#C9A227]/50 bg-[#C9A227]/10 text-[#C9A227]";

  return (
    <div className="relative z-50 flex min-h-full flex-1 flex-col">
      <SiteNav active="status" />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-5 pb-16 sm:px-8">
        <p className="text-[11px] tracking-[0.32em] text-[#C9A227] uppercase">
          Status // ledger
        </p>
        <h1 className="font-display mt-4 text-4xl text-[#E8E0D4]">
          Read your place at the door.
        </h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-[#E8E0D4]/60">
          Petitions begin under review. If the Order chooses you, this page will say you&apos;re
          on the list. Nothing here is automatic favor.
        </p>

        {!ready ? (
          <p className="mt-10 text-sm tracking-[0.12em] text-[#C9A227]/80">Opening the ledger.</p>
        ) : (
          <div className="mt-10 border border-[#C9A227]/25 bg-[#0C0C11]/80 p-6 sm:p-8">
            <Badge className={cn("rounded-none", badgeTone)}>{copy.badge}</Badge>
            <h2 className="font-display mt-4 text-3xl text-[#E8E0D4]">{copy.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[#E8E0D4]/70">{copy.body}</p>
            {state.connected && (
              <p className="mt-4 font-mono text-xs text-[#E8E0D4]/45">
                @{state.handle}
                {state.walletAddress ? ` · ${state.walletAddress}` : ""}
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              {!state.connected && state.oauthEnabled && (
                <a
                  href="/api/auth/twitter"
                  className={cn(
                    buttonVariants(),
                    "rounded-none bg-[#C9A227] text-[#07070A] hover:bg-[#C9A227]/90"
                  )}
                >
                  Connect X
                </a>
              )}
              {state.connected && (
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
                {state.submitted ? "Return to Index" : "Leave a petition"}
              </Link>
            </div>
            <p className="mt-6 text-xs text-[#E8E0D4]/40">
              Watch @{UMBRA_X_HANDLE}. Relics worn in shadow.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
