import { getAddress, isAddress } from "viem";

export type WalletResult =
  | { ok: true; address: string | null }
  | { ok: false; error: string };

export function normalizeWallet(
  input: string | null | undefined,
  options: { required?: boolean } = {}
): WalletResult {
  const raw = input?.trim() ?? "";
  if (!raw) {
    if (options.required) {
      return { ok: false, error: "An ETH wallet is required to petition." };
    }
    return { ok: true, address: null };
  }

  if (!isAddress(raw, { strict: false })) {
    return { ok: false, error: "That is not a valid EVM address." };
  }

  const body = raw.slice(2);
  const allLower = body === body.toLowerCase();
  const allUpper = body === body.toUpperCase();
  if (!allLower && !allUpper && !isAddress(raw, { strict: true })) {
    return { ok: false, error: "Address checksum does not match." };
  }

  return { ok: true, address: getAddress(raw) };
}
