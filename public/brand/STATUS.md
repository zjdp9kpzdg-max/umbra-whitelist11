# Whitelist brand — STATUS (2026-09-12 04:18 EDT)

Site art cohesion pass. Same paths the site already uses. No new logo.

## Review

- `/workspace/umbra-whitelist-push/public/brand/hero_warden.png` — BASE_WARDEN 800² lean bust (was a CG human face)
- `/workspace/umbra-whitelist-push/public/brand/warden.png` — same BASE_WARDEN 800²
- `/workspace/umbra-whitelist-push/public/brand/bg.jpg` — charcoal northstar void field (1920×1080), hood held to the right
- `/workspace/umbra-whitelist-push/public/brand/emblem.png` — locked seal on charcoal (was CG 3D mark)
- `/workspace/umbra-whitelist-push/public/brand/northstar_void.jpeg` — refreshed from locked STYLE_NORTHSTAR_void
- `/workspace/umbra-whitelist-push/public/brand/seal.png` — unchanged (locked sealed emblem)
- `/workspace/umbra-whitelist-push/public/brand/icon-180.png` — unchanged
- Priors: `/workspace/umbra-whitelist-push/public/brand/_prior/`

## Site file edit

- `/workspace/umbra-whitelist-push/components/quest-app.tsx` — dropped gold hairline frame + glow on the hero so the drawing is not poster-framed. RelicMark overlay still uses `seal.png`.
- `relic-mark.tsx` / `layout.tsx` / `globals.css` — paths unchanged (`seal.png`, `icon-180.png`, `bg.jpg`).

## What this is not

- Not a new logo. Not a trait preview. Not pushed to GitHub.
- DNS / deploy not part of this pass.
