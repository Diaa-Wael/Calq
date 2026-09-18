# Calq — Modern Scientific Calculator

Calq is a responsive TypeScript + Vite calculator UI inspired by the keypad arrangement of the reference **Casio fx-991ES PLUS 2nd edition** calculator.

The app intentionally uses its own modern visual treatment rather than reproducing the product shell or logo. The reference keypad is organized around SHIFT / ALPHA / replay / MODE / ON controls, scientific function keys, and the 5-column numeric/operator area.

## Included

- TypeScript calculator logic
- Modern dark hardware-inspired UI
- Natural-display style screen
- Responsive mobile layout that fills the phone viewport
- iOS / Android safe-area support
- Landscape-phone breakpoint
- Touch / mouse / keyboard interaction
- SHIFT and ALPHA indicators
- DEG / RAD toggle
- Trigonometry and inverse trigonometry
- Hyperbolic trig toggle
- Powers, roots, logarithms, factorial
- Memory and Ans
- Engineering notation
- Fraction-style toggle
- Calculation history replay control
- Light/dark display toggle
- Favicon SVG

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, normally:

`http://localhost:5173`

## Production build

```bash
npm run build
```

The production build is generated in `dist/`.
