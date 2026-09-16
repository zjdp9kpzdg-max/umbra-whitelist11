import { Suspense } from "react";
import { QuestApp } from "@/components/quest-app";

function LedgerFallback() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center text-sm tracking-[0.16em] text-[#C9A227]/80">
      loading.
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<LedgerFallback />}>
      <QuestApp />
    </Suspense>
  );
}
