import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";

export function SignalDoc({
  kicker,
  active,
  body,
}: {
  kicker: string;
  active: "manifesto" | "whitepaper";
  body: string;
}) {
  return (
    <div className="relative z-50 flex min-h-full flex-1 flex-col">
      <SiteNav active={active} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-16 sm:px-8">
        <article className="mx-auto mt-8 max-w-xl space-y-6">
          <p className="font-mono text-[11px] tracking-[0.22em] text-[#3DDC84]">
            {kicker}
          </p>
          <div className="whitespace-pre-wrap font-mono text-[15px] leading-7 text-[#E8E0D4]/78 sm:text-base">
            {body}
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
