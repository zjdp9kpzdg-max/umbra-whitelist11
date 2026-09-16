import Link from "next/link";
import { DropCta } from "@/components/drop-cta";
import { SignalHero } from "@/components/signal-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";

export function SignalHome() {
  return (
    <div className="relative z-50 flex min-h-full flex-1 flex-col">
      <SiteNav active="drop" />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-16 sm:px-8">
        <div className="mb-12">
          <DropCta />
        </div>
        <SignalHero />
        <section className="mt-16 grid gap-4 sm:grid-cols-2">
          <Link
            href="/manifesto"
            className="border border-[#C9A227]/25 bg-[#0C0C11]/80 p-6 transition-colors hover:border-[#C9A227]/55 sm:p-8"
          >
            <p className="font-mono text-[11px] tracking-[0.22em] text-[#C9A227]">
              manifesto
            </p>
            <p className="mt-3 font-mono text-xl text-[#E8E0D4]">
              we didn’t set out to build culture.
            </p>
            <p className="mt-3 text-sm leading-6 text-[#E8E0D4]/60">
              rules we actually believe. the feather is not financial advice.
              neither is the duck.
            </p>
          </Link>
          <Link
            href="/whitepaper"
            className="border border-[#C9A227]/25 bg-[#0C0C11]/80 p-6 transition-colors hover:border-[#C9A227]/55 sm:p-8"
          >
            <p className="font-mono text-[11px] tracking-[0.22em] text-[#C9A227]">
              whitepaper
            </p>
            <p className="mt-3 font-mono text-xl text-[#E8E0D4]">
              serious face. 1,111 heads.
            </p>
            <p className="mt-3 text-sm leading-6 text-[#E8E0D4]/60">
              this document exists so people stop asking for a document. tiny
              robinhood feather exists. tiny sol does not.
            </p>
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
