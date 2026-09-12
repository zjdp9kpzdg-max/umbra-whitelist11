"use client";

import { useCallback, useState } from "react";
import type { ApplicationStatus, Registration } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FILTERS: Array<ApplicationStatus | "all"> = [
  "all",
  "pending",
  "approved",
  "rejected",
];

export function AdminDesk() {
  const [token, setToken] = useState("");
  const [filter, setFilter] = useState<ApplicationStatus | "all">("pending");
  const [rows, setRows] = useState<Registration[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const headers = useCallback(
    () => ({
      ADMIN_TOKEN: token,
      "Content-Type": "application/json",
    }),
    [token]
  );

  async function load(nextFilter = filter) {
    setBusy("load");
    setError(null);
    try {
      const query = nextFilter === "all" ? "" : `?status=${nextFilter}`;
      const res = await fetch(`/api/admin/submissions${query}`, {
        headers: headers(),
        cache: "no-store",
      });
      const data = (await res.json()) as { submissions?: Registration[]; error?: string };
      if (!res.ok) throw new Error(data.error || "The ledger would not open.");
      setRows(data.submissions ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The ledger would not open.");
      setRows([]);
    } finally {
      setBusy(null);
    }
  }

  async function decide(twitterUserId: string, status: ApplicationStatus) {
    setBusy(twitterUserId + status);
    setError(null);
    try {
      const res = await fetch("/api/admin/submissions", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ twitterUserId, status }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Review failed.");
      await load(filter);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Review failed.");
    } finally {
      setBusy(null);
    }
  }

  function exportHref(status?: ApplicationStatus | "all") {
    const query = !status || status === "all" ? "" : `?status=${status}`;
    return `/api/admin/export${query}`;
  }

  async function download(status?: ApplicationStatus | "all") {
    setBusy("export");
    try {
      const res = await fetch(exportHref(status), { headers: headers() });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error || "Export failed.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `umbra-petitions-${status ?? "all"}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
      <p className="text-[11px] tracking-[0.32em] text-[#C9A227] uppercase">
        Order // Review
      </p>
      <h1 className="font-display mt-3 text-4xl text-[#E8E0D4]">Petitions</h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-[#E8E0D4]/60">
        Submissions wait here. Approval writes them to the mint list. Rejection
        closes the door. Nothing is automatic.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <Label htmlFor="admin-token" className="text-xs text-[#E8E0D4]/50">
            ADMIN_TOKEN
          </Label>
          <Input
            id="admin-token"
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="mt-2 h-10 rounded-none border-[#C9A227]/30 bg-[#07070A] font-mono"
            autoComplete="off"
          />
        </div>
        <Button
          className="rounded-none bg-[#C9A227] text-[#07070A]"
          onClick={() => load(filter)}
          disabled={!token || busy === "load"}
        >
          Open the ledger
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <Button
            key={item}
            variant={filter === item ? "default" : "outline"}
            className="rounded-none"
            onClick={() => {
              setFilter(item);
              if (token) void load(item);
            }}
          >
            {item}
          </Button>
        ))}
        <Button
          variant="outline"
          className="rounded-none"
          onClick={() => download(filter)}
          disabled={!token}
        >
          Export CSV
        </Button>
        <Button
          variant="outline"
          className="rounded-none"
          onClick={() => download("approved")}
          disabled={!token}
        >
          Export approved wallets
        </Button>
      </div>

      {error && (
        <p className="mt-6 border border-[#8F3A32]/40 bg-[#8F3A32]/10 px-4 py-3 text-sm text-[#E8C4BC]">
          {error}
        </p>
      )}

      <div className="mt-8 overflow-x-auto border border-[#C9A227]/20">
        <table className="w-full min-w-[720px] text-left text-xs text-[#E8E0D4]/80">
          <thead className="bg-[#12131A] text-[10px] tracking-[0.16em] text-[#C9A227] uppercase">
            <tr>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Handle</th>
              <th className="px-3 py-3">X id</th>
              <th className="px-3 py-3">Wallet</th>
              <th className="px-3 py-3">Like</th>
              <th className="px-3 py-3">RT</th>
              <th className="px-3 py-3">Submitted</th>
              <th className="px-3 py-3">Review</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-[#E8E0D4]/40">
                  {token ? "No petitions in this drawer." : "Enter the token to see the names."}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.twitterUserId} className="border-t border-[#C9A227]/10">
                  <td className="px-3 py-3 uppercase">{row.status}</td>
                  <td className="px-3 py-3">@{row.twitterHandle}</td>
                  <td className="px-3 py-3 font-mono text-[10px]">{row.twitterUserId}</td>
                  <td className="px-3 py-3 font-mono text-[10px]">{row.walletAddress}</td>
                  <td className="px-3 py-3">{row.liked ? "yes" : "no"}</td>
                  <td className="px-3 py-3">{row.retweeted ? "yes" : "no"}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{row.submittedAt.slice(0, 19)}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      <Button
                        size="xs"
                        className="rounded-none"
                        disabled={busy !== null}
                        onClick={() => decide(row.twitterUserId, "approved")}
                      >
                        Approve
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        className="rounded-none"
                        disabled={busy !== null}
                        onClick={() => decide(row.twitterUserId, "rejected")}
                      >
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
