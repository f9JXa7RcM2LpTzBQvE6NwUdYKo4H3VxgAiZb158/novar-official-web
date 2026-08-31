# Hero Phone Product Tour Implementation Plan

> **For agentic workers:** Implement task-by-task. Steps use checkbox syntax.

**Goal:** Replace the static hero phone logo with a looping Splash → Feed → Lessons product tour.

**Architecture:** HTML slide stack inside `.hero-phone-content`, CSS transitions + dots, `HeroPhoneTour.js` for interval/hover/reduced-motion.

**Tech Stack:** Vanilla HTML/CSS/JS modules (existing site patterns).

## Global Constraints

- Sequence: Splash (branded) → `feed.png` → `lessons.png`
- Interval ~2.8s; crossfade + slight upward slide
- Pause on hover (desktop); reduced-motion shows Feed only
- Full-bleed screenshots; no overlay badges
- Keep existing phone frame / aspect ratio
- `shorts.png` out of scope

---

### Task 1: Markup + CSS tour slides

**Files:** `index.html`, `css/main.css`

- [x] Replace logo-only phone content with tour slides + dots
- [x] Style splash, screenshots, active slide, transitions, dots
- [x] Reduced-motion CSS fallback
- [x] Bump CSS cache query

### Task 2: Tour JS module

**Files:** `js/modules/HeroPhoneTour.js`, `js/main.js`

- [x] Create module: cycle slides, dots, hover pause, reduced-motion
- [x] Wire into `main.js` with cache-bust version
- [x] Verify locally in browser

---
