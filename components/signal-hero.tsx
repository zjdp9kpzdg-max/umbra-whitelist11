import Image from "next/image";
import { PixelGif } from "@/components/pixel-gif";
import { buttonVariants } from "@/components/ui/button";
import {
  SIGNAL_CAST,
  SIGNAL_MINT_URL,
  SIGNAL_MORPH_SRC,
  SIGNAL_STILL_SRC,
} from "@/lib/brand";
import { SIGNAL_STORY } from "@/lib/signal-story";
import { cn } from "@/lib/utils";

export function SignalHero() {
  return (
    <section className="space-y-10">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-8 bg-[#3DDC84]/10 blur-3xl" />
          <div className="relative w-full max-w-[460px]">
            <div className="relative aspect-square overflow-hidden border border-[#3DDC84]/20 bg-[#050508] shadow-[0_0_60px_rgba(7,7,10,0.85)]">
              <PixelGif
                src={SIGNAL_MORPH_SRC}
                fallback={SIGNAL_STILL_SRC}
                alt="signal"
                width={460}
                height={460}
                priority
                className="pixel relative h-full w-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-xl lg:mx-0">
          <p className="font-mono text-[11px] tracking-[0.28em] text-[#3DDC84]">
            signal · 1,111
          </p>
          <p className="mt-6 whitespace-pre-wrap font-mono text-[15px] leading-7 text-[#E8E0D4]/78 sm:text-base">
            {SIGNAL_STORY}
          </p>
          <div className="mt-8 space-y-3">
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
        </div>
      </div>

      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6 sm:gap-4">
        {SIGNAL_CAST.map((face) => (
          <li
            key={face.key}
            className="overflow-hidden border border-white/10 bg-[#050508]"
          >
            <Image
              src={face.src}
              alt=""
              width={160}
              height={160}
              unoptimized
              className="pixel aspect-square h-auto w-full object-cover"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
