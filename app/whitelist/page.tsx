import { Suspense } from "react";
import { redirect } from "next/navigation";
import { QuestApp } from "@/components/quest-app";
import { isWhitelistEnabled } from "@/lib/flags";

function LedgerFallback() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center text-sm tracking-[0.16em] text-[#C9A227]/80">
      loading.
    </div>
  );
}

export default function WhitelistPage() {
  if (!isWhitelistEnabled()) {
    redirect("/");
  }
  return (
    <Suspense fallback={<LedgerFallback />}>
      <QuestApp />
    </Suspense>
  );
}
