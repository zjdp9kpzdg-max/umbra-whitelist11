/** Public petition UI. Launch default is off. Restore with NEXT_PUBLIC_WHITELIST_ENABLED=true. */
export function isWhitelistEnabled(): boolean {
  return process.env.NEXT_PUBLIC_WHITELIST_ENABLED === "true";
}
