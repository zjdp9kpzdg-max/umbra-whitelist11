import { Suspense } from "react";
import { StatusDesk } from "@/components/status-desk";

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
  return (
    <Suspense fallback={<Fallback />}>
      <StatusDesk />
    </Suspense>
  );
}
