import type { ReactNode } from "react";

function MarkdownDoc({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, "\n").trim().split("\n");
  const nodes: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") {
      i += 1;
      continue;
    }
    if (line.startsWith("# ")) {
      nodes.push(
        <h1
          key={key++}
          className="font-mono text-3xl leading-snug text-[#E8E0D4] sm:text-4xl"
        >
          {line.slice(2)}
        </h1>
      );
      i += 1;
      continue;
    }
    if (line.startsWith("## ")) {
      nodes.push(
        <h2
          key={key++}
          className="font-mono pt-4 text-[11px] tracking-[0.22em] text-[#C9A227] uppercase"
        >
          {line.slice(3)}
        </h2>
      );
      i += 1;
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i += 1;
      }
      nodes.push(
        <ol
          key={key++}
          className="space-y-2 border border-[#C9A227]/20 bg-[#0C0C11]/80 p-5 text-sm leading-6 text-[#E8E0D4]/78"
        >
          {items.map((item, idx) => (
            <li key={item} className="flex gap-3">
              <span className="font-mono text-[11px] tracking-[0.16em] text-[#C9A227]">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }
    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2));
        i += 1;
      }
      nodes.push(
        <ul
          key={key++}
          className="space-y-2 text-sm leading-6 text-[#E8E0D4]/78"
        >
          {items.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="text-[#3DDC84]" aria-hidden>
                ·
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("# ") &&
      !lines[i].startsWith("## ") &&
      !lines[i].startsWith("- ") &&
      !/^\d+\.\s/.test(lines[i])
    ) {
      para.push(lines[i]);
      i += 1;
    }
    nodes.push(
      <p
        key={key++}
        className="whitespace-pre-wrap font-mono text-[15px] leading-7 text-[#E8E0D4]/78 sm:text-base"
      >
        {para.join("\n")}
      </p>
    );
  }

  return <div className="space-y-5">{nodes}</div>;
}

export function SignalDoc({
  kicker,
  source,
}: {
  kicker: string;
  source: string;
}) {
  return (
    <article className="mx-auto w-full max-w-2xl space-y-8">
      <p className="font-mono text-[11px] tracking-[0.22em] text-[#3DDC84]">
        {kicker}
      </p>
      <MarkdownDoc source={source} />
    </article>
  );
}
