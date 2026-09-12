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
    <header className="mx-auto flex w-full max-w-6xl items-end justify-between gap-6 px-5 py-6 sm:px-8">
      <Link href="/" className="flex items-center gap-3">
        <RelicMark size={44} priority className="h-11 w-11 shrink-0" />
        <div>
          <p className="font-display text-2xl tracking-[0.34em] text-[#C9A227]">UMBRA</p>
          <p className="mt-1 text-xs tracking-[0.18em] text-[#E8E0D4]/55 uppercase">
            Relics worn in shadow.
          </p>
        </div>
      </Link>
      <nav className="flex items-center gap-4 text-[11px] tracking-[0.2em] text-[#E8E0D4]/50 uppercase">
        {link("/", "petition", "Petition")}
        {link("/status", "status", "Status")}
      </nav>
    </header>
  );
}
