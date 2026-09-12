import { getAdminToken } from "@/lib/env";
import { safeEqual } from "@/lib/oauth";

export function readAdminToken(request: Request): string {
  return (
    request.headers.get("admin_token") ||
    request.headers.get("ADMIN_TOKEN") ||
    request.headers.get("x-admin-token") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    ""
  );
}

export function assertAdmin(request: Request): { ok: true } | { ok: false; status: number; error: string } {
  const expected = getAdminToken();
  if (!expected) {
    return { ok: false, status: 503, error: "ADMIN_TOKEN is not configured." };
  }
  const given = readAdminToken(request);
  if (!given || !safeEqual(given, expected)) {
    return { ok: false, status: 401, error: "Unauthorized." };
  }
  return { ok: true };
}
