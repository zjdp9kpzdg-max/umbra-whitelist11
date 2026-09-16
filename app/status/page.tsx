import { Suspense } from "react";
import { redirect } from "next/navigation";
import { StatusDesk } from "@/components/status-desk";
import { isWhitelistEnabled } from "@/lib/flags";

export const metadata = {
  title: "signal · status",
  description: "check if you're on the list. not a promise.",
};

function Fallback() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center text-sm tracking-[0.16em] text-[#C9A227]/80">
      loading.
    </div>
  );
}

export default function StatusPage() {
  if (!isWhitelistEnabled()) {
    redirect("/");
  }
  return (
    <Suspense fallback={<Fallback />}>
      <StatusDesk />
    </Suspense>
  );
}
