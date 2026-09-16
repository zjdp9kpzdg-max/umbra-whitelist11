import type { Metadata } from "next";
import { DropCta } from "@/components/drop-cta";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { SignalDoc } from "@/components/signal-doc";
import { SIGNAL_WHITEPAPER } from "@/lib/signal-whitepaper";

export const metadata: Metadata = {
  title: "signal · whitepaper",
  description:
    "1,111 hand-pixel radio / crt heads. this document exists so people stop asking for a document.",
};

export default function WhitepaperPage() {
  return (
    <div className="relative z-50 flex min-h-full flex-1 flex-col">
      <SiteNav active="whitepaper" />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-16 sm:px-8">
        <SignalDoc kicker="signal · 1,111" source={SIGNAL_WHITEPAPER} />
        <div className="mx-auto mt-16 max-w-2xl">
          <DropCta compact />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
