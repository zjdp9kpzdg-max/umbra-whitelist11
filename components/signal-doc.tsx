import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { buttonVariants } from "@/components/ui/button";
import { SIGNAL_MINT_URL } from "@/lib/brand";
import { cn } from "@/lib/utils";

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
          <div className="space-y-3 pt-4">
            <a
              href={SIGNAL_MINT_URL}
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants(),
                "h-11 rounded-none bg-[#3DDC84] px-6 text-[#07070A] hover:bg-[#3DDC84]/90"
              )}
            >
              1,111 free mint only
            </a>
            <p className="font-mono text-xs leading-5 text-[#E8E0D4]/45">
              you pay gas. one wallet. don’t be weird.
            </p>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
