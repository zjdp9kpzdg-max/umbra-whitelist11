"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { RelicMark } from "@/components/relic-mark";
import { SiteNav } from "@/components/site-nav";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UMBRA_X_HANDLE, UMBRA_X_URL } from "@/lib/brand";
import { normalizeHandle } from "@/lib/handle";
import { cn } from "@/lib/utils";
import type { PublicState } from "@/lib/types";
import { normalizeWallet } from "@/lib/wallet";

const emptyState: PublicState = {
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

function Mark({ done }: { done: boolean }) {
  return (
    <span
      className={`flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${
        done
          ? "border-[#1F6B4A] bg-[#1F6B4A] text-[#E8E0D4]"
          : "border-[#C9A227]/40 text-[#C9A227]/70"
      }`}
      aria-hidden
    >
      {done ? "·" : ""}
    </span>
  );
}

function TaskLink({
  href,
  disabled,
  children,
}: {
  href: string | null;
  disabled?: boolean;
  children: ReactNode;
}) {
  const className = cn(
    buttonVariants({ variant: "outline" }),
    "rounded-none border-[#C9A227]/35",
    disabled && "pointer-events-none opacity-40"
  );
  if (!href || disabled) {
    return <span className={className}>{children}</span>;
  }
  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {children}
    </a>
  );
}

export function QuestApp() {
  const navActive = "petition" as const;
  const searchParams = useSearchParams();
  const [state, setState] = useState<PublicState | null>(null);
  const [handle, setHandle] = useState("");
  const [handleError, setHandleError] = useState<string | null>(null);
  const [attestedLike, setAttestedLike] = useState(false);
  const [attestedRt, setAttestedRt] = useState(false);
  const [attestedFollow, setAttestedFollow] = useState(false);
  const [wallet, setWallet] = useState("");
  const [walletError, setWalletError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"verify" | "register" | "logout" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const queryError = searchParams.get("error");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/session", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("The ledger would not open.");
        return (await res.json()) as PublicState;
      })
      .then((data) => {
        if (cancelled) return;
        setState(data);
        if (data.walletAddress) setWallet(data.walletAddress);
        if (data.handle) setHandle(data.handle);
        if (data.liked) setAttestedLike(true);
        if (data.retweeted) setAttestedRt(true);
        if (data.followed) setAttestedFollow(true);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : "The ledger would not open.");
        setState(emptyState);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const displayError = error || queryError || loadError;
  const current = state ?? emptyState;
  const ready = Boolean(state);
  const oauth = current.oauthEnabled;
  const bearer = current.bearerEnabled;
  const walletCheck = normalizeWallet(wallet, { required: true });
  const handleCheck = normalizeHandle(handle);
  const liked = oauth
    ? current.liked
    : bearer
      ? current.liked || (current.likeUnsupported && attestedLike)
      : attestedLike;
  const retweeted = oauth || bearer ? current.retweeted : attestedRt;
  const followed = oauth
    ? current.followed || (current.followUnsupported && attestedFollow)
    : bearer
      ? current.followed || (current.followUnsupported && attestedFollow)
      : attestedFollow;
  const identityReady = oauth ? current.connected : handleCheck.ok;
  const canRegister = identityReady && liked && retweeted && followed && walletCheck.ok;
  const canVerify = oauth ? current.connected : bearer && handleCheck.ok;

  const tweetHref = useMemo(() => current.tweetUrl, [current.tweetUrl]);

  function validateWalletField(value: string) {
    const result = normalizeWallet(value, { required: true });
    if (!result.ok) {
      setWalletError(result.error);
      return false;
    }
    setWalletError(null);
    if (result.address) setWallet(result.address);
    return true;
  }

  function validateHandleField(value: string) {
    const result = normalizeHandle(value);
    if (!result.ok) {
      setHandleError(result.error);
      return false;
    }
    setHandleError(null);
    setHandle(result.handle);
    return true;
  }

  async function verify() {
    setBusy("verify");
    setError(null);
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle }),
      });
      const data = (await res.json()) as PublicState & { error?: string };
      if (!res.ok) throw new Error(data.error || "Verification failed.");
      setState(data);
      if (data.error) {
        setError(data.error);
      } else if (
        !data.liked ||
        !data.retweeted ||
        (!data.followed && !data.followUnsupported)
      ) {
        const missing = [
          !data.followed && !data.followUnsupported ? "follow" : null,
          !data.liked ? "like" : null,
          !data.retweeted ? "retweet" : null,
        ].filter(Boolean);
        if (missing.length > 0) {
          const label = missing.join(", ");
          setError(
            `The marks are incomplete. ${label.charAt(0).toUpperCase()}${label.slice(1)} still waiting.`
          );
        } else if (data.followUnsupported && !data.followed) {
          setError("Follow could not be read by X — mark that you follow @UMBRAStudio11.");
        }
      } else if (data.followed || data.liked) {
        if (data.followed) setAttestedFollow(true);
        if (data.liked) setAttestedLike(true);
        if (data.retweeted) setAttestedRt(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setBusy(null);
    }
  }

  async function register() {
    if (!oauth && !validateHandleField(handle)) return;
    if (!validateWalletField(wallet)) return;
    setBusy("register");
    setError(null);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet,
          handle,
          liked: oauth || (bearer && !current.likeUnsupported) ? current.liked : attestedLike,
          retweeted: oauth || bearer ? current.retweeted : attestedRt,
          followed:
            oauth || (bearer && !current.followUnsupported)
              ? current.followed
              : attestedFollow,
        }),
      });
      const data = (await res.json()) as PublicState & { error?: string };
      if (!res.ok) {
        if (
          typeof data.liked === "boolean" ||
          typeof data.retweeted === "boolean" ||
          typeof data.followed === "boolean"
        ) {
          setState((prev) =>
            prev
              ? {
                  ...prev,
                  liked: data.liked ?? prev.liked,
                  retweeted: data.retweeted ?? prev.retweeted,
                  followed: data.followed ?? prev.followed,
                  followUnsupported: data.followUnsupported ?? prev.followUnsupported,
                }
              : prev
          );
        }
        throw new Error(data.error || "Registration failed.");
      }
      setState(data);
      if (data.walletAddress) setWallet(data.walletAddress);
      if (data.handle) setHandle(data.handle);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setBusy(null);
    }
  }

  async function logout() {
    setBusy("logout");
    await fetch("/api/auth/logout", { method: "POST" });
    setState({
      ...(state ?? emptyState),
      connected: false,
      handle: null,
      userId: null,
      name: null,
      liked: false,
      retweeted: false,
      followed: false,
      followUnsupported: false,
      submitted: false,
      status: null,
      walletAddress: null,
    });
    setHandle("");
    setWallet("");
    setAttestedLike(false);
    setAttestedRt(false);
    setAttestedFollow(false);
    setBusy(null);
  }

  return (
    <div className="relative z-50 flex min-h-full flex-1 flex-col">
      <SiteNav active={navActive} />

      <main className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 items-center gap-12 px-5 pb-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <section className="space-y-8">
          <div className="space-y-5">
            <p className="text-[11px] tracking-[0.32em] text-[#C9A227] uppercase">
              Petition // 001
            </p>
            <h1 className="font-display max-w-xl text-4xl leading-[1.15] text-[#E8E0D4] sm:text-5xl">
              After names became liabilities, an order bound identity into relics.
            </h1>
            <p className="max-w-md text-base leading-7 text-[#E8E0D4]/70">
              {oauth
                ? "Petition the Order. Bind your X. Follow, like, and retweet. Enter the ETH address at the door."
                : "Petition the Order. Leave your X. Follow, like, and retweet. Enter the ETH address at the door."}{" "}
              Selection is not guaranteed.
            </p>
          </div>

          {!ready && (
            <p className="text-sm tracking-[0.12em] text-[#C9A227]/80">Opening the ledger.</p>
          )}

          {ready && current.submitted ? (
            <div
              className={
                current.status === "approved"
                  ? "border border-[#1F6B4A]/50 bg-[#1F6B4A]/10 p-6 sm:p-8"
                  : current.status === "rejected"
                    ? "border border-[#8F3A32]/40 bg-[#8F3A32]/10 p-6 sm:p-8"
                    : "border border-[#C9A227]/30 bg-[#C9A227]/5 p-6 sm:p-8"
              }
            >
              <Badge
                className={
                  current.status === "approved"
                    ? "rounded-none border-[#1F6B4A] bg-[#1F6B4A] text-[#E8E0D4]"
                    : current.status === "rejected"
                      ? "rounded-none border-[#8F3A32] bg-[#8F3A32]/30 text-[#E8C4BC]"
                      : "rounded-none border-[#C9A227]/50 bg-[#C9A227]/15 text-[#C9A227]"
                }
              >
                {current.status === "approved"
                  ? "On the list"
                  : current.status === "rejected"
                    ? "Closed"
                    : "Under review"}
              </Badge>
              <h2 className="font-display mt-4 text-3xl text-[#E8E0D4]">
                {current.status === "approved"
                  ? "You're on the list."
                  : current.status === "rejected"
                    ? "This door does not open."
                    : "Under review."}
              </h2>
              <p className="mt-3 text-sm text-[#E8E0D4]/65">
                @{current.handle}
                {current.walletAddress ? ` · ${current.walletAddress}` : ""}
              </p>
              <p className="mt-6 text-xs leading-6 text-[#E8E0D4]/45">
                {current.status === "approved"
                  ? "The Order has marked this name. Watch @" + UMBRA_X_HANDLE + "."
                  : current.status === "rejected"
                    ? "The petition was received and set aside."
                    : "Your petition waits in the ledger. Selection is not guaranteed. Check Status anytime."}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/status"
                  className="inline-flex h-9 items-center rounded-none border border-[#C9A227]/40 px-4 text-sm text-[#E8E0D4] hover:border-[#C9A227]"
                >
                  Check status
                </Link>
                <Button
                  variant="outline"
                  className="rounded-none border-[#C9A227]/40"
                  onClick={logout}
                  disabled={busy === "logout"}
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="border border-[#C9A227]/25 bg-[#0C0C11]/80 p-6 sm:p-8">
              <ol className="space-y-7">
                <li className="flex gap-4">
                  <Mark done={identityReady} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] tracking-[0.22em] text-[#C9A227] uppercase">
                      01 · {oauth ? "Bind your X" : "Leave your X"}
                    </p>
                    {oauth ? (
                      <>
                        <p className="mt-1 text-sm text-[#E8E0D4]/70">
                          {current.connected
                            ? `Bound as @${current.handle}.`
                            : "Connect X. The handle becomes the name we keep."}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {current.connected ? (
                            <Button
                              variant="outline"
                              className="rounded-none border-[#C9A227]/35"
                              onClick={logout}
                              disabled={busy === "logout"}
                            >
                              Disconnect
                            </Button>
                          ) : (
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
                        </div>
                      </>
                    ) : (
                      <>
                        <Label htmlFor="handle" className="mt-1 text-sm font-normal text-[#E8E0D4]/70">
                          Enter your X handle. Required.
                        </Label>
                        <Input
                          id="handle"
                          value={handle}
                          onChange={(e) => {
                            setHandle(e.target.value);
                            setHandleError(null);
                          }}
                          onBlur={() => {
                            if (handle.trim()) validateHandleField(handle);
                          }}
                          placeholder="@handle"
                          className="mt-3 h-10 rounded-none border-[#C9A227]/30 bg-[#07070A] text-sm"
                          autoComplete="off"
                          spellCheck={false}
                        />
                        {handleError && (
                          <p className="mt-2 text-xs text-[#C4A08A]">{handleError}</p>
                        )}
                        <div className="mt-3 flex flex-col gap-2">
                          <Button
                            className="w-fit rounded-none bg-[#C9A227] text-[#07070A]"
                            disabled
                          >
                            Connect X
                          </Button>
                          <p className="text-[11px] leading-5 text-[#E8E0D4]/35">
                            Owner: Connect X needs OAuth 2.0 client id/secret in hosting.
                            A Bearer token can check a handle against the quest post but
                            cannot sign visitors in. Never paste keys here or in chat.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </li>

                <li className="flex gap-4">
                  <Mark done={followed && liked && retweeted} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] tracking-[0.22em] text-[#C9A227] uppercase">
                      02 · Follow · like · retweet
                    </p>
                    <p className="mt-1 text-sm text-[#E8E0D4]/70">
                      Follow @{UMBRA_X_HANDLE}. Like the quest post. Retweet it. All three marks are required.
                    </p>
                    {!current.targetTweetId && (
                      <p className="mt-3 text-xs text-[#C9A227]/80">
                        The quest post is waking. Watch @{UMBRA_X_HANDLE}.
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <TaskLink href={current.followUrl} disabled={!current.followUrl}>
                        Follow @{UMBRA_X_HANDLE}
                      </TaskLink>
                      <TaskLink href={current.likeUrl} disabled={!current.likeUrl}>
                        Like
                      </TaskLink>
                      <TaskLink href={current.retweetUrl} disabled={!current.retweetUrl}>
                        Retweet
                      </TaskLink>
                      <TaskLink href={tweetHref} disabled={!tweetHref}>
                        Open quest
                      </TaskLink>
                      {(oauth || bearer) && (
                        <Button
                          className="rounded-none bg-[#C9A227] text-[#07070A] hover:bg-[#C9A227]/90"
                          onClick={verify}
                          disabled={!canVerify || busy === "verify"}
                        >
                          {busy === "verify" ? "Verifying…" : "Verify follow, like, retweet"}
                        </Button>
                      )}
                    </div>
                    {(oauth || bearer) && (
                      <ul className="mt-3 space-y-2 text-sm text-[#E8E0D4]/80">
                        <li className="flex items-center gap-2">
                          <Mark done={followed} />
                          Follow{" "}
                          {followed
                            ? "seen"
                            : current.followUnsupported
                              ? "attest below"
                              : "waiting"}
                        </li>
                        <li className="flex items-center gap-2">
                          <Mark done={current.liked || liked} />
                          Like{" "}
                          {current.liked
                            ? "seen"
                            : current.likeUnsupported
                              ? "unreadable here"
                              : "waiting"}
                        </li>
                        <li className="flex items-center gap-2">
                          <Mark done={current.retweeted} />
                          Retweet {current.retweeted ? "seen" : "waiting"}
                        </li>
                      </ul>
                    )}
                    {!oauth && (
                      <div className="mt-4 space-y-2 text-sm text-[#E8E0D4]/80">
                        {(!bearer || current.followUnsupported) && (
                          <label className="flex cursor-pointer items-center gap-3">
                            <input
                              type="checkbox"
                              checked={attestedFollow}
                              onChange={(e) => setAttestedFollow(e.target.checked)}
                              className="size-4 accent-[#1F6B4A]"
                            />
                            I follow @{UMBRA_X_HANDLE}.
                          </label>
                        )}
                        {(!bearer || current.likeUnsupported) && (
                          <label className="flex cursor-pointer items-center gap-3">
                            <input
                              type="checkbox"
                              checked={attestedLike}
                              onChange={(e) => setAttestedLike(e.target.checked)}
                              className="size-4 accent-[#1F6B4A]"
                            />
                            I liked the quest post.
                          </label>
                        )}
                        {!bearer && (
                          <label className="flex cursor-pointer items-center gap-3">
                            <input
                              type="checkbox"
                              checked={attestedRt}
                              onChange={(e) => setAttestedRt(e.target.checked)}
                              className="size-4 accent-[#1F6B4A]"
                            />
                            I retweeted the quest post.
                          </label>
                        )}
                      </div>
                    )}
                    {oauth && current.followUnsupported && (
                      <div className="mt-4 space-y-2 text-sm text-[#E8E0D4]/80">
                        <label className="flex cursor-pointer items-center gap-3">
                          <input
                            type="checkbox"
                            checked={attestedFollow}
                            onChange={(e) => setAttestedFollow(e.target.checked)}
                            className="size-4 accent-[#1F6B4A]"
                          />
                          I follow @{UMBRA_X_HANDLE}.
                        </label>
                      </div>
                    )}
                  </div>
                </li>

                <li className="flex gap-4">
                  <Mark done={walletCheck.ok} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] tracking-[0.22em] text-[#C9A227] uppercase">
                      03 · Enter ETH address
                    </p>
                    <Label htmlFor="wallet" className="mt-1 text-sm font-normal text-[#E8E0D4]/70">
                      Enter your ETH wallet address. Required. If you are chosen, this is the door we open.
                    </Label>
                    <Input
                      id="wallet"
                      value={wallet}
                      onChange={(e) => {
                        setWallet(e.target.value);
                        setWalletError(null);
                      }}
                      onBlur={() => validateWalletField(wallet)}
                      placeholder="0x…"
                      className="mt-3 h-10 rounded-none border-[#C9A227]/30 bg-[#07070A] font-mono text-sm"
                      required
                      autoComplete="off"
                      spellCheck={false}
                    />
                    {walletError && (
                      <p className="mt-2 text-xs text-[#C4A08A]">{walletError}</p>
                    )}
                  </div>
                </li>
              </ol>

              <div className="mt-8 border-t border-[#C9A227]/20 pt-6">
                <Button
                  className="h-11 w-full rounded-none bg-[#C9A227] text-[#07070A] hover:bg-[#C9A227]/90 sm:w-auto sm:px-8"
                  onClick={register}
                  disabled={!canRegister || busy === "register"}
                >
                  {busy === "register" ? "Sending…" : "Submit your petition"}
                </Button>
                {!canRegister && (
                  <p className="mt-3 text-xs text-[#E8E0D4]/40">
                    {oauth
                      ? "Bind X, follow · like · retweet, then enter a valid ETH address."
                      : "Leave your X, follow · like · retweet, then enter a valid ETH address."}
                  </p>
                )}
              </div>
            </div>
          )}

          {displayError && (
            <p className="border border-[#8F3A32]/40 bg-[#8F3A32]/10 px-4 py-3 text-sm text-[#E8C4BC]">
              {displayError}
            </p>
          )}
        </section>

        <aside className="relative flex items-center justify-center lg:min-h-[520px]">
          <div className="absolute inset-10 bg-[#1F6B4A]/10 blur-3xl" />
          <div className="relative w-full max-w-[420px]">
            <Image
              src="/brand/hero_warden.png"
              alt="UMBRA warden"
              width={800}
              height={800}
              priority
              className="relative w-full border border-[#C9A227]/20 shadow-[0_0_40px_rgba(201,162,39,0.08)]"
            />
            <div className="pointer-events-none absolute -bottom-3 -right-3 sm:bottom-4 sm:right-4">
              <RelicMark size={88} className="h-16 w-16 sm:h-20 sm:w-20 drop-shadow-[0_0_18px_rgba(7,7,10,0.9)]" />
            </div>
          </div>
        </aside>
      </main>

      <footer className="mt-auto border-t border-[#C9A227]/15 px-5 py-6 sm:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 text-xs leading-6 text-[#E8E0D4]/40 sm:flex-row sm:items-start sm:justify-between">
          <p>
            UMBRA. Relics worn in shadow.{" "}
            <a
              href={UMBRA_X_URL}
              target="_blank"
              rel="noreferrer"
              className="text-[#C9A227]/70 hover:text-[#C9A227]"
            >
              @{UMBRA_X_HANDLE}
            </a>
          </p>
          <p className="max-w-xl sm:text-right">
            UMBRA is an independent project. Not affiliated with Robinhood Markets,
            Inc., its affiliates, or its products.
          </p>
        </div>
      </footer>
    </div>
  );
}
