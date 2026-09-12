import { Suspense } from "react";
import { StatusDesk } from "@/components/status-desk";

export const metadata = {
  title: "UMBRA · Status",
  description: "Read your petition status. Under review, or on the list.",
};

function Fallback() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center text-sm tracking-[0.16em] text-[#C9A227]/80">
      Opening the ledger.
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
