import Image from "next/image";
import Link from "next/link";
import { SIGNAL_STILL_SRC, SIGNAL_SUPPLY } from "@/lib/brand";
import { SIGNAL_DROP_URL } from "@/lib/drop";
import { isWhitelistEnabled } from "@/lib/flags";
import { cn } from "@/lib/utils";

export type NavActive =
  | "drop"
  | "manifesto"
  | "whitepaper"
  | "petition"
  | "status";

export function SiteNav({ active }: { active?: NavActive }) {
  const whitelist = isWhitelistEnabled();
  const link = (href: string, key: NavActive, label: string) => (
    <Link
      href={href}
      className={active === key ? "text-[#3DDC84]" : "hover:text-[#3DDC84]"}
    >
      {label}
    </Link>
  );

  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-5 py-6 sm:px-8">
      <Link href="/" className="flex items-center gap-3">
        <Image
          src={SIGNAL_STILL_SRC}
          alt=""
          width={44}
          height={44}
          unoptimized
          priority
          className="pixel h-11 w-11 shrink-0"
        />
        <div>
          <p className="font-mono text-xl tracking-[0.28em] text-[#3DDC84]">
            signal
          </p>
          <p className="mt-1 font-mono text-[11px] tracking-[0.18em] text-[#E8E0D4]/45">
            {SIGNAL_SUPPLY}
          </p>
        </div>
      </Link>
      <nav className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 font-mono text-[11px] tracking-[0.16em] text-[#E8E0D4]/50">
        {link("/manifesto", "manifesto", "manifesto")}
        {link("/whitepaper", "whitepaper", "whitepaper")}
        {whitelist ? (
          <>
            {link("/whitelist", "petition", "petition")}
            {link("/status", "status", "status")}
          </>
        ) : null}
        <a
          href={SIGNAL_DROP_URL}
          target="_blank"
          rel="noreferrer"
          className={cn(
            "border border-[#C9A227] bg-[#C9A227] px-3 py-1.5 text-[#07070A] hover:bg-[#C9A227]/90",
            active === "drop" && "ring-1 ring-[#3DDC84]/70"
          )}
        >
          mint
        </a>
      </nav>
    </header>
  );
}
