import Image from "next/image";

/** Signal still — 407 fallback face. */

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
      src="/signal/407.png"
      alt="signal"
      width={size}
      height={size}
      unoptimized
      priority={priority}
      className={`pixel ${className ?? ""}`}
    />
  );
}
