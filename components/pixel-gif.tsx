"use client";

import Image from "next/image";
import { useState } from "react";

export function PixelGif({
  src,
  fallback,
  alt,
  className,
  width,
  height,
  priority = false,
}: {
  src: string;
  fallback?: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}) {
  const [current, setCurrent] = useState(src);

  return (
    <Image
      src={current}
      alt={alt}
      width={width ?? 320}
      height={height ?? 320}
      unoptimized
      priority={priority}
      className={className}
      onError={() => {
        if (fallback && current !== fallback) setCurrent(fallback);
      }}
    />
  );
}
