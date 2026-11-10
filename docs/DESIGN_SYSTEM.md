# Design System & UI Styling Architecture

This document documents the design system, CSS architecture, color tokens, typography, glassmorphism surfaces, and responsive breakpoints implemented across the Malayalam University frontend.

---

## 1. CSS Architecture & Structure

The project avoids heavy utility frameworks like Tailwind or Bootstrap in favor of **modular Vanilla CSS**. Global tokens and reset are centralized in [`src/styles/index.css`](file:///home/sabir/projects/mu/src/styles/index.css) and cascaded across specialized stylesheets:

```
src/styles/
├── index.css             # Core design tokens, CSS reset, typography, and theme
├── pages.css             # Page templates, inner heroes, cards, and tables
├── department-modern.css # Department portal sidebar, hero, and tab styling
├── faculties.css         # Academic faculties directory styling
├── floatingSocial.css    # Docked floating social bar styling
├── landing.css           # Intro landing screen animations and slides
├── link-card.css         # Reusable link card utilities
├── megaMenu.css          # Mega menu dropdowns, columns, and mobile drawer
├── megaCenter.css        # Alignment helpers for wide mega menu panels
├── normalMenu.css        # Fallback standard dropdown styling
└── social-activities.css # Community outreach activities grid and modal
```

---

## 2. Design Tokens & Palette

Defined in `:root` inside [`src/styles/index.css`](file:///home/sabir/projects/mu/src/styles/index.css#L17-L49):

```css
:root {
  /* Backgrounds */
  --bg0: #eef2f8;
  --bg1: #f5f8fd;

  /* Card Surfaces */
  --card: rgba(255, 255, 255, .96);
  --card2: rgba(255, 255, 255, .99);

  /* Border Strokes */
  --stroke: rgba(26, 58, 110, .14);
  --stroke2: rgba(26, 58, 110, .08);

  /* Typography Colors */
  --text: #1e2d45;
  --muted: #3d5170;
  --muted2: #6b809e;

  /* Brand Palette (Navy & Gold Theme) */
  --primary: #1a3a6e;        /* Deep Navy Blue */
  --primary-light: #2a5298;  /* Royal Blue Accent */
  --primary-dark: #0f2347;   /* Midnight Navy */
  --secondary: #1e88e5;      /* Cobalt Blue */
  --accent: #f0b429;         /* Warm Gold */
  --accent-dark: #d69e20;    /* Antique Gold */

  /* Semantic Feedback */
  --warn: #e53935;
  --success: #43a047;
  --info: #039be5;

  /* Geometry & Elevation */
  --radius: 16px;
  --shadow: 0 8px 32px rgba(26, 58, 110, .12);
  --shadow2: 0 4px 16px rgba(26, 58, 110, .07);
  --blur: 12px;

  /* Layout Scale */
  --container: 1300px;
  --navH: 108px;
}
```

---

## 3. Typography Scale & Font Families

The site loads Google Fonts in [`index.html`](file:///home/sabir/projects/mu/index.html):
- **`Noto Sans Malayalam`**: Primary typeface for native Malayalam script (`font-weight: 400, 500, 600, 700`).
- **`Inter`**: Latin numbers and standard body UI.
- **`Montserrat`**: English headline and UI font (`body.lang-en`).

```css
/* Malayalam (Default) */
body {
  font-family: Inter, "Noto Sans Malayalam", system-ui, -apple-system, sans-serif;
  color: var(--text);
  background: var(--bg0);
}

/* English Switcher */
body.lang-en {
  font-family: "Montserrat", sans-serif;
}
```

---

## 4. Surfaces & Micro-Animations

### 1. Animated Geometric Grid Background (`.grid-bg`)
A subtle animated grid is rendered across all pages (except `/landing`):
```css
.grid-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: .04;
  background-image:
    linear-gradient(rgba(26, 58, 110, .08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(26, 58, 110, .07) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(closest-side at 50% 25%, rgba(0, 0, 0, .8), rgba(0, 0, 0, .1));
  animation: drift 25s linear infinite;
}

@keyframes drift {
  0% { transform: translateY(0); }
  100% { transform: translateY(56px); }
}
```

### 2. Glassmorphic Surface Cards (`.surface`)
```css
.surface {
  border: 1px solid var(--stroke);
  background: var(--card);
  backdrop-filter: blur(var(--blur));
  box-shadow: var(--shadow2);
  border-radius: var(--radius);
}
```

### 3. Scroll Reveal Animations (`.page-reveal`)
Components activate `.active` class when scrolled into the viewport:
```css
.reveal-up {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.reveal-up.active {
  opacity: 1;
  transform: translateY(0);
}
```

---

## 5. Reusable UI Components

### 1. Buttons
- `.btn.primary`: Solid navy background (`var(--primary)`), white text, smooth hover lift, gold accent border on focus.
- `.btn-small`: Compact button used for "Read more / Show less" expandable content toggles.
- `.landing-skip-btn`: Pill button with gold glow on the landing intro page.

### 2. Cards
- `.department-card`: Bordered surface with hover elevation, department title, excerpt preview, and arrow CTA.
- `.portal-card`: High-elevation portal navigation cards used for empty-content submenu fallbacks.
- `.course-card`: Horizontal card featuring course thumbnail, title, and syllabus excerpt.
- `.initiative-card`: Clean card with featured SVG icon, project title, and link metadata.

### 3. Lightbox Portal
Full-screen modal portal (`.lightbox-overlay`) with backdrop blur, image centered scaling, prev/next arrows, and ESC key listener.

---

## 6. Responsive Breakpoints

| Breakpoint | Target Devices | Layout Adaptations |
| :--- | :--- | :--- |
| **`> 1200px`** | Large Desktops | Full container (`1300px`), full mega menu dropdown grid, multi-column portal cards. |
| **`980px - 1199px`** | Medium Laptops & Tablets (Landscape) | MegaMenu collapses into a touch-friendly mobile drawer (`#burger`). Dropdowns switch to click-to-expand. |
| **`768px - 979px`** | Tablets (Portrait) | Department single layout collapses from 2-column sidebar into stacked accordion. Home cards display 2 per row. |
| **`576px - 767px`** | Large Smartphones | Grids collapse to single-column (1 card per row). Header ticker simplifies. |
| **`< 480px`** | Small Smartphones | Padding reduced to 12px, font sizes scaled down, floating social dock auto-collapses. |
