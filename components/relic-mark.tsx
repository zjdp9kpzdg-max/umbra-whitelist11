import Image from "next/image";

/** Locked UMBRA seal — same mark as X / brand kit. Do not invent variants. */
export function RelicMark({
  className,
  size = 320,
  priority = false,
}: {
  className?: string;
  size?: number;
  priority?: boolean;
}) {
  return (
    <Image
      src="/brand/seal.png"
      alt="UMBRA"
      width={size}
      height={size}
      priority={priority}
      className={className}
    />
  );
}
