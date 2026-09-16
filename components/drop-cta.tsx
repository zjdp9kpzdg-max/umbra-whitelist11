import { PixelGif } from "@/components/pixel-gif";
import { buttonVariants } from "@/components/ui/button";
import { SIGNAL_STILL_SRC } from "@/lib/brand";
import {
  SIGNAL_DROP_DATE,
  SIGNAL_DROP_OPENS,
  SIGNAL_DROP_URL,
  SIGNAL_UNREVEALED_SRC,
} from "@/lib/drop";
import { cn } from "@/lib/utils";

export function DropCta({ compact = false }: { compact?: boolean }) {
  return (
    <section
      id="drop"
      className={cn(
        "scroll-mt-8 border border-[#C9A227]/35 bg-[#0C0C11]/90",
        compact ? "p-5 sm:p-6" : "p-6 sm:p-8"
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-6",
          compact ? "sm:flex-row sm:items-center" : "lg:flex-row lg:items-center"
        )}
      >
        <div className="relative mx-auto w-full max-w-[220px] shrink-0 lg:mx-0">
          <div className="relative aspect-square overflow-hidden border border-[#3DDC84]/25 bg-[#050508]">
            <PixelGif
              src={SIGNAL_UNREVEALED_SRC}
              fallback={SIGNAL_STILL_SRC}
              alt="signal unrevealed"
              width={220}
              height={220}
              priority
              className="pixel relative h-full w-full object-cover"
            />
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-4">
          <p className="font-mono text-[11px] tracking-[0.28em] text-[#C9A227]">
            drop · live
          </p>
          <h2 className="font-mono text-2xl leading-snug text-[#E8E0D4] sm:text-3xl">
            mint signal. free. one wallet.
          </h2>
          <p className="max-w-xl text-sm leading-6 text-[#E8E0D4]/70">
            public {SIGNAL_DROP_OPENS.toLowerCase()} · {SIGNAL_DROP_DATE}. you
            pay gas. unrevealed until 1,111 / 1,111 sold out. then the heads
            show up.
          </p>
          <div className="flex flex-wrap gap-2 font-mono text-[11px] tracking-[0.16em] text-[#E8E0D4]/45">
            <span className="border border-[#C9A227]/30 px-2 py-1">0 eth</span>
            <span className="border border-[#C9A227]/30 px-2 py-1">
              1 / wallet
            </span>
            <span className="border border-[#C9A227]/30 px-2 py-1">
              hidden till sell-out
            </span>
          </div>
          <a
            href={SIGNAL_DROP_URL}
            target="_blank"
            rel="noreferrer"
            className={cn(
              buttonVariants(),
              "h-12 rounded-none bg-[#C9A227] px-8 text-sm tracking-[0.14em] text-[#07070A] uppercase hover:bg-[#C9A227]/90"
            )}
          >
            mint on opensea
          </a>
        </div>
      </div>
    </section>
  );
}
