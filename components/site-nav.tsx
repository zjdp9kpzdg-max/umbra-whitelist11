import Image from "next/image";
import Link from "next/link";
import { RelicMark } from "@/components/relic-mark";

export function SiteNav({ active }: { active?: "petition" | "status" }) {
  const link = (href: string, key: typeof active, label: string) => (
    <Link
      href={href}
      className={active === key ? "text-[#C9A227]" : "hover:text-[#C9A227]"}
    >
      {label}
    </Link>
  );

  return (
    <div className="w-full">
      <div className="relative w-full overflow-hidden border-b border-[#C9A227]/15">
        <Image
          src="/brand/x_banner.jpg"
          alt="UMBRA — Relics worn in shadow"
          width={1500}
          height={500}
          priority
          className="h-[120px] w-full object-cover object-center sm:h-[160px] md:h-[200px]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#07070A]/20 via-transparent to-[#07070A]/85" />
      </div>
      <header className="mx-auto flex w-full max-w-6xl items-end justify-between gap-6 px-5 py-6 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <RelicMark size={44} priority className="h-11 w-11 shrink-0" />
          <div>
            <p className="font-display text-2xl tracking-[0.34em] text-[#C9A227]">UMBRA</p>
            <p className="font-display mt-2 text-xl leading-tight tracking-[0.04em] text-[#E8E0D4] sm:text-2xl">
              Art project. That&apos;s it.
            </p>
            <p className="mt-1.5 text-xs tracking-[0.18em] text-[#E8E0D4]/55 uppercase">
              Relics worn in shadow.
            </p>
          </div>
        </Link>
        <nav className="flex items-center gap-4 text-[11px] tracking-[0.2em] text-[#E8E0D4]/50 uppercase">
          {link("/", "petition", "Petition")}
          {link("/status", "status", "Status")}
        </nav>
      </header>
    </div>
  );
}
