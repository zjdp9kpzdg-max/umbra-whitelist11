import { SignalDoc } from "@/components/signal-doc";
import { SIGNAL_WHITEPAPER } from "@/lib/signal-whitepaper";

export const metadata = {
  title: "signal · whitepaper",
  description: "this document exists so people stop asking for a document.",
};

export default function WhitepaperPage() {
  return (
    <SignalDoc
      kicker="whitepaper (serious face)"
      active="whitepaper"
      body={SIGNAL_WHITEPAPER}
    />
  );
}
