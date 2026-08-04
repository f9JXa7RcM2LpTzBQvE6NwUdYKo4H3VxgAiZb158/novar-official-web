# Hero Phone Product Tour — Design Spec

**Date:** 2026-08-04  
**Status:** Approved (pending final user review of this doc)  
**Scope:** Stronger hero phone demo — looping product tour inside the existing handset frame

## Goal

Make the hero phone feel like a live NOVAR product, not a static logo placeholder. This should communicate tech-company energy: real product surfaces, smooth motion, premium craft.

## Approach

**Hybrid**

1. **Splash** — branded CSS/HTML open using existing logo assets (`assets/novar.png` / app logo), soft pulse  
2. **Feed** — real screenshot `assets/feed.png`  
3. **Learning Video** — real screenshot `assets/lessons.png`

`assets/shorts.png` is **available but out of scope** for v1 (optional later swap for Learning Video or a 4th beat).

## Tour sequence

| Order | Screen | Source | Duration |
|------|--------|--------|----------|
| 1 | Splash | Branded mock (logo + soft pulse) | ~2.8s |
| 2 | Feed | `feed.png` | ~2.8s |
| 3 | Learning Video | `lessons.png` | ~2.8s |

Then loop to Splash.

## Motion & interaction

- Transition: soft crossfade + slight upward slide (~400–500ms)  
- Interval: ~2.8s per screen (including transition)  
- Indicators: small dots below screen content (or overlay bottom of phone content); active = teal accent  
- Desktop: pause loop on hover over the phone  
- `prefers-reduced-motion: reduce`: no loop; show Feed screenshot as the static default  
- Do **not** place floating badges, stickers, or callout chips on top of screenshots  

## Visual constraints

- Keep existing slim handset frame (`hero-phone-frame`), notch, and status bar  
- Screenshots fill the phone **screen area** edge-to-edge (`object-fit: cover` / crop as needed — no letterboxing)  
- Splash remains white/light to match real app chrome  
- Preserve current phone aspect ratio (~9:19.5) and responsive width rules  

## Technical sketch

- HTML: replace logo-only `.hero-phone-content` with a small tour stack (3 slides + dots)  
- CSS: slide states, fade/slide transition, cursor/dot styles, reduced-motion fallback  
- JS: lightweight module (e.g. `HeroPhoneTour.js`) started from `main.js`  
  - interval timer  
  - hover pause/resume  
  - reduced-motion early exit  
- Assets: use existing files only; no new image generation required  

## Out of scope (v1)

- Real video playback inside the phone  
- Interactive tap-through of in-app UI  
- Using `shorts.png` in the loop  
- Changing hero copy, store buttons, or typewriter behavior  

## Success criteria

- On load, phone cycles Splash → Feed → Lessons without layout jump  
- Screenshots look native inside the frame (full-bleed, sharp)  
- Motion feels premium and intentional, not noisy  
- Reduced-motion users get a stable Feed still  
- Works on mobile + desktop breakpoints already used by the hero  

## Open decisions (defaults locked unless changed)

- Learning Video uses `lessons.png` (not `shorts.png`)  
- Interval ~2.8s  
- Pause-on-hover desktop only  
