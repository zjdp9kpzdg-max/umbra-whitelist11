export const UMBRA_X_HANDLE = "UMBRAStudio11";
export const UMBRA_X_URL = `https://x.com/${UMBRA_X_HANDLE}`;
export const UMBRA_X_USER_ID = "2098545625193205766";
export const UMBRA_X_FOLLOW_URL = `https://x.com/intent/follow?screen_name=${UMBRA_X_HANDLE}`;

export const SIGNAL_NAME = "signal";
export const SIGNAL_SUPPLY = "1,111";
export const SIGNAL_SITE_URL = "https://umbra1111.xyz";
export const SIGNAL_MINT_URL = "https://opensea.io/collection/signal-158424856";
export const SIGNAL_OG_IMAGE = "/signal/407.png";
export const SIGNAL_MORPH_SRC = "/signal/signal_morph_wtf.gif?v=gm2";
export const SIGNAL_STILL_SRC = "/signal/407.png";

/** Petition form (Connect X / send petition). Default off so production hides it. */
export const WHITELIST_ENABLED =
  process.env.NEXT_PUBLIC_WHITELIST_ENABLED === "true";

/** Decorative loops only — no trait labels on the page. */
export const SIGNAL_CAST = [
  { src: "/signal/signal_407_toaster.gif", key: "toaster" },
  { src: "/signal/signal_073_duck.gif?v=gm2", key: "duck" },
  { src: "/signal/signal_198_pizza.gif", key: "pizza" },
  { src: "/signal/signal_592_plunger.gif?v=gm2", key: "plunger" },
  { src: "/signal/signal_146_cone.gif", key: "cone" },
  { src: "/signal/signal_idle_blink.gif", key: "idle" },
] as const;
