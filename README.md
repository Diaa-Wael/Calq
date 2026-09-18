# Calq

Calq is a responsive TypeScript + Vite scientific calculator UI styled around the classic ES-series natural-display calculator layout.

## What changed

- Scientific keypad is no longer a generic 4-column calculator.
- Dedicated exponent controls: **x²** and **xʸ** now work.
- The `^` keyboard key also inserts an exponent operator.
- **√**, **∛**, **1/x**, **x!**, **log**, **ln**, **10ˣ**, **eˣ**, trig and inverse trig controls are wired up.
- DEG / RAD / GRAD angle modes.
- SHIFT and ALPHA state indicators.
- Natural-display-style LCD and physical-key styling.
- Mobile portrait and landscape layouts with safe-area support.
- Keyboard and touch input.
- Replay history, memory recall/store, Ans, fraction toggle, and engineering notation.

The visual branding uses **CALQ** as the app wordmark while taking visual cues from the supplied ES-style reference rather than presenting the app as an official Casio product.

## Run

```bash
npm install
npm run dev
```

Then open the local Vite URL, normally:

```text
http://localhost:5173
```

## Production build

```bash
npm run build
```
