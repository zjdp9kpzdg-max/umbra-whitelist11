import { SignalDoc } from "@/components/signal-doc";
import { SIGNAL_MANIFESTO } from "@/lib/signal-manifesto";

export const metadata = {
  title: "signal · manifesto",
  description: "we are not your alpha. we are your pfp problem.",
};

export default function ManifestoPage() {
  return (
    <SignalDoc kicker="manifesto" active="manifesto" body={SIGNAL_MANIFESTO} />
  );
}
