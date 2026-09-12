export type HandleResult =
  | { ok: true; handle: string }
  | { ok: false; error: string };

export function normalizeHandle(input: string | null | undefined): HandleResult {
  const raw = (input ?? "").trim().replace(/^@/, "");
  if (!raw) {
    return { ok: false, error: "An X handle is required." };
  }
  if (!/^[A-Za-z0-9_]{1,15}$/.test(raw)) {
    return { ok: false, error: "That is not a valid X handle." };
  }
  return { ok: true, handle: raw };
}

export function honorUserId(handle: string): string {
  return `honor:${handle.toLowerCase()}`;
}
