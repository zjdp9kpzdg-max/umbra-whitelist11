import Image from "next/image";
import Link from "next/link";
import {
  SIGNAL_STILL_SRC,
  SIGNAL_SUPPLY,
  WHITELIST_ENABLED,
} from "@/lib/brand";

export function SiteNav({
  active,
}: {
  active?: "petition" | "status" | "manifesto" | "whitepaper";
}) {
  const link = (href: string, key: typeof active, label: string) => (
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
          <p className="font-mono text-xl tracking-[0.28em] text-[#3DDC84]">signal</p>
          <p className="mt-1 font-mono text-[11px] tracking-[0.18em] text-[#E8E0D4]/45">
            {SIGNAL_SUPPLY}
          </p>
        </div>
      </Link>
      <nav className="flex flex-wrap items-center justify-end gap-4 font-mono text-[11px] tracking-[0.16em] text-[#E8E0D4]/50">
        {WHITELIST_ENABLED ? link("/#petition", "petition", "petition") : null}
        {link("/manifesto", "manifesto", "manifesto")}
        {link("/whitepaper", "whitepaper", "whitepaper")}
        {link("/status", "status", "status")}
      </nav>
    </header>
  );
}
