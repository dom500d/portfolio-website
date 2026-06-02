# Design Language: Dynamic Motion

## Philosophy

Speed. Momentum. Forward trajectory. This design language draws from the aesthetics of competitive cycling, automotive performance, and aerodynamic engineering. Every element suggests movement, even at rest.

---

## Color Palette

### Primary Colors
| Name | Hex | Usage |
|------|-----|-------|
| **Void** | `#0a0a0a` | Primary background |
| **Carbon** | `#141414` | Secondary background, cards |
| **Graphite** | `#1f1f1f` | Tertiary surfaces |
| **Steel** | `#2a2a2a` | Borders, dividers |

### Accent Colors
| Name | Hex | Usage |
|------|-----|-------|
| **Velocity** | `#00ff87` | Primary accent (neon green) |
| **Heat** | `#ff6b35` | Secondary accent (orange) |
| **Electric** | `#00d4ff` | Tertiary accent (cyan) |

### Text Colors
| Name | Hex | Usage |
|------|-----|-------|
| **White** | `#ffffff` | Primary text |
| **Smoke** | `#a0a0a0` | Secondary text |
| **Ash** | `#666666` | Tertiary text, disabled |

### Gradients
```css
/* Motion gradient - suggests speed lines */
--gradient-velocity: linear-gradient(135deg, #00ff87 0%, #00d4ff 100%);

/* Heat gradient - performance, intensity */
--gradient-heat: linear-gradient(135deg, #ff6b35 0%, #ff0066 100%);

/* Fade to black - depth */
--gradient-depth: linear-gradient(180deg, #141414 0%, #0a0a0a 100%);
```

---

## Typography

### Font Stack
```css
/* Headlines - Bold, condensed, athletic */
--font-display: 'Space Grotesk', sans-serif;

/* Body - Clean, readable */
--font-body: 'Inter', sans-serif;

/* Mono - Code, data, technical */
--font-mono: 'JetBrains Mono', monospace;
```

### Type Scale
| Level | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| Hero | 72px / 4.5rem | 700 | 1.0 | Landing page name |
| H1 | 48px / 3rem | 700 | 1.1 | Page titles |
| H2 | 32px / 2rem | 600 | 1.2 | Section headers |
| H3 | 24px / 1.5rem | 600 | 1.3 | Subsections |
| Body | 16px / 1rem | 400 | 1.6 | Paragraphs |
| Small | 14px / 0.875rem | 400 | 1.5 | Captions, meta |
| Micro | 12px / 0.75rem | 500 | 1.4 | Labels, tags |

### Text Treatments
- **Headlines:** All caps with wide letter-spacing (`letter-spacing: 0.05em`)
- **Accent text:** Use `--gradient-velocity` as `background-clip: text`
- **Technical data:** Monospace, tabular numbers

---

## Layout Principles

### Grid System
- 12-column grid on desktop
- Gutter: 24px
- Max content width: 1400px
- Edge margins: 5vw minimum

### Angles & Diagonals
The signature element. Use subtle diagonal cuts and skewed elements:
```css
/* Diagonal clip - 5 degree angle */
clip-path: polygon(0 0, 100% 0, 100% calc(100% - 3vw), 0 100%);

/* Skewed accent bar */
transform: skewX(-5deg);
```

### Asymmetric Balance
- Avoid centered layouts
- Use weighted compositions (60/40, 70/30 splits)
- Let content "break" grid lines intentionally
- Offset elements create visual tension

### Whitespace
- Generous spacing between sections (120px+)
- Tight spacing within components
- Let elements breathe

---

## Components

### Cards
```css
.card {
  background: var(--carbon);
  border: 1px solid var(--steel);
  border-radius: 2px; /* Sharp, not rounded */
  position: relative;
  overflow: hidden;
}

/* Accent edge - colored bar on left */
.card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--gradient-velocity);
}

/* Hover state - lifts and glows */
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 255, 135, 0.1);
}
```

### Buttons
```css
.button-primary {
  background: var(--velocity);
  color: var(--void);
  font-family: var(--font-display);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 16px 32px;
  border: none;
  position: relative;
  clip-path: polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.button-primary:hover {
  transform: translateX(4px);
  box-shadow: -4px 0 0 var(--heat);
}
```

### Navigation
- Fixed header, blur backdrop
- Logo/name on left, links on right
- Links underline with accent gradient on hover
- Mobile: Full-screen overlay with large type

### Section Dividers
```css
.divider {
  height: 1px;
  background: linear-gradient(90deg,
    transparent 0%,
    var(--steel) 20%,
    var(--velocity) 50%,
    var(--steel) 80%,
    transparent 100%
  );
}
```

---

## Motion & Animation

### Principles
1. **Forward momentum** - Elements enter from left/bottom, exit right/top
2. **Ease-out curves** - Start fast, decelerate (like braking)
3. **Stagger delays** - Sequential reveals create rhythm
4. **Subtle parallax** - Depth without distraction

### Timing
```css
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;

--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
```

### Scroll Animations
- Hero text: Fade up with slight scale
- Cards: Slide in from left, staggered
- Images: Subtle parallax (slower scroll rate)
- Section headers: Wipe reveal with gradient

### Hover States
- Cards: Lift + glow
- Links: Underline draws left-to-right
- Buttons: Shift right + shadow accent
- Images: Subtle scale (1.02) + brightness

### Page Transitions
- Content fades/slides out to right
- New content enters from left
- Duration: 400ms

---

## Imagery

### Photography Style
- High contrast, desaturated base
- Accent color overlays or duotones
- Motion blur where appropriate
- Tight crops, dynamic angles

### Treatment
```css
.image-container {
  position: relative;
  overflow: hidden;
}

/* Gradient overlay for depth */
.image-container::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(0, 255, 135, 0.1) 0%,
    transparent 50%,
    rgba(0, 0, 0, 0.3) 100%
  );
  pointer-events: none;
}
```

### Icons
- Line style, 1.5px stroke
- Sharp corners (no rounding)
- Accent color on hover
- Custom set or Phosphor Icons

---

## Specific Sections

### Hero / Landing
- Full viewport height
- Large name with gradient text treatment
- Tagline in secondary text
- Subtle animated background (diagonal lines or particles)
- Scroll indicator with animated arrow

### Projects Grid
- Masonry or asymmetric grid
- Cards with project thumbnail, title, tags
- Diagonal clip on hover reveal
- Filter by category (ML, Hardware, Cars, etc.)

### About Section
- Large portrait with diagonal mask
- Bio text with highlighted key phrases
- Stats/metrics in monospace (years coding, projects, etc.)
- Skills visualized as bars or progress indicators

### Experience Timeline
- Vertical line with accent gradient
- Cards alternating left/right
- Dates in monospace
- Company logos desaturated, color on hover

### Contact
- Simple form with minimal fields
- Button with motion effect
- Social links as icon row
- Optional: Animated background element

---

## Responsive Behavior

### Breakpoints
```css
--bp-mobile: 480px;
--bp-tablet: 768px;
--bp-desktop: 1024px;
--bp-wide: 1400px;
```

### Mobile Adaptations
- Stack to single column
- Reduce diagonal angles (performance)
- Larger touch targets (48px minimum)
- Simplified animations
- Hamburger menu with full-screen overlay

---

## Accessibility

- Respect `prefers-reduced-motion`
- Color contrast meets WCAG AA (4.5:1 for body text)
- Focus states clearly visible (accent color outline)
- Skip links for keyboard navigation
- Semantic HTML structure

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## File Structure (Proposed)

```
/
├── index.html
├── projects.html
├── about.html
├── contact.html
├── css/
│   ├── reset.css
│   ├── variables.css
│   ├── base.css
│   ├── components.css
│   ├── layout.css
│   ├── animations.css
│   └── responsive.css
├── js/
│   ├── main.js
│   ├── animations.js
│   └── navigation.js
└── assets/
    ├── fonts/
    ├── images/
    └── icons/
```

---

## Summary

**This is a portfolio that moves.** It's confident, technical, and athletic. The dark foundation lets the neon accents pop. The diagonal elements and motion design create energy without chaos. It feels like the website of someone who builds fast things - whether that's autonomous vehicles, turbocharged cars, or ML models.
