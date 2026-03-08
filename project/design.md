# Design System: SaaS 2.0

## Core Aesthetic Philosophy
The Consensus Engine utilizes a highly premium **"SaaS 2.0"** design language. It abandons traditional flat, data-heavy dashboards in favor of spatial awareness, physical depth, and high-end glassmorphism.

### Atmosphere & Lighting
- **Ice White Base:** The default light mode uses `#F8FAFC`, providing an ultra-clean, clinical backdrop.
- **Focal Glows:** Major architectural elements (like the 3D core) sit above intense, blurred radial gradients to anchor the user's eye.
- **Dark Mode:** A deep spatial void (`#0B0F19`) triggered via local storage replacement.

### Typography
- **Primary:** `Geist Variable` (or Inter fallback) provides tight geometry and deep software-engineering legibility.
- **Hierarchy:** High-contrast Slate (`#0F172A`) for headers, dropping to muted Silver (`#475569`) for descriptive text.

## Layout Methodology
### The Bento Grid
All core modules (AI Mentor, Analytics, Voice UI) are packed into a CSS Grid-based "Bento Box" (`.bento-grid`). 
- Cards scale based on importance (`bento-large` spans 2x2, `bento-small` spans 1x1).
- Ensures impeccable horizontal and vertical rhythm while scaling perfectly down to mobile.

### Breathable Spacing
Universal vertical padding of `96px` (`py-24`) forces deep breathing room between sections, preventing the interface from feeling cluttered or overwhelming.

## Micro-Interactions & Physics
- **Anti-Gravity Hover:** Cards utilize perspective-shifting scripts (`rotateX`/`rotateY`) tied to mouse position to simulate deep 3D physical movement.
- **Glassmorphism:** Cards sit behind a robust `backdrop-filter: blur(12px)` and feature an ultra-subtle `1px` translucent edge to mimic polished physical glass.
- **Holographic Foil:** Select premium elements dynamically update a CSS conic-gradient via Javascript `Math.atan2` cursor tracking to simulate the light-bending of trading cards.
