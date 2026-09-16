import { UMBRA_X_HANDLE, UMBRA_X_URL } from "@/lib/brand";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/10 px-5 py-6 sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 font-mono text-xs leading-6 text-[#E8E0D4]/40 sm:flex-row sm:items-start sm:justify-between">
        <p>
          signal. 1,111 heads.{" "}
          <a
            href={UMBRA_X_URL}
            target="_blank"
            rel="noreferrer"
            className="text-[#3DDC84]/70 hover:text-[#3DDC84]"
          >
            @{UMBRA_X_HANDLE}
          </a>
        </p>
        <p className="max-w-xl sm:text-right">not a promise. not a team.</p>
      </div>
    </footer>
  );
}
