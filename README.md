# Calq

**Calq** is a modern, responsive scientific calculator built with **TypeScript, HTML, CSS, and Vite**.

It combines the convenience of a web app with the familiar interaction style of classic natural-display scientific calculators, while being optimized for desktop, tablet, and mobile screens.

> **Note:** Calq is an independent project inspired by classic scientific-calculator interfaces. It is **not affiliated with or endorsed by Casio**.

## Features

- Classic scientific-calculator-inspired keypad
- Natural-display-style LCD interface
- `x²` exponentiation
- `xʸ` power/exponent input
- Square root `√`
- Cube root `∛`
- Reciprocal `1/x`
- Factorial `x!`
- Logarithms: `log`, `ln`
- Exponential functions: `10ˣ`, `eˣ`
- Trigonometric functions: `sin`, `cos`, `tan`
- Inverse trigonometric functions through **SHIFT**: `sin⁻¹`, `cos⁻¹`, `tan⁻¹`
- DEG / RAD / GRAD angle modes
- SHIFT and ALPHA modifier states
- Memory functions
- `Ans` previous-answer support
- Replay/history controls
- Fraction input
- Engineering notation
- Keyboard input
- Touch-friendly controls
- Responsive mobile layout
- Full-screen mobile calculator mode
- Safe-area support for modern phones
- Press animation on calculator keys

## Natural Input

Calq supports calculator-style function entry without requiring you to manually close function parentheses.

For example:

```text
sin(30
=
```

produces:

```text
0.5
```

The same behavior is supported for other unary functions.

## Exponents

Use the `xʸ` key for arbitrary powers.

Example:

```text
2
xʸ
3
=
```

Result:

```text
8
```

The square key can be used for:

```text
5
x²
=
```

Result:

```text
25
```

Keyboard exponent input is also supported with `^`.

## Degree-Minute-Second (DMS)

The `° ′ ″` key supports classic sexagesimal angle input. Press it after a degree value to add `°`, then after the minutes value to add `′`, then after the seconds value to add `″`. SHIFT on the same key converts a decimal angle to DMS notation.

Example: `2°20′30″` evaluates as `2.341666...`, and `2.255` converted with SHIFT becomes `2°15′18″`.

## SHIFT Functions

Press **SHIFT** to activate the alternate function layer.

For example:

```text
SHIFT
sin
```

uses `sin⁻¹`.

Likewise:

```text
SHIFT
cos
```

uses `cos⁻¹`, and:

```text
SHIFT
tan
```

uses `tan⁻¹`.

## Mobile Support

Calq is designed to use the available phone viewport efficiently.

The mobile interface includes:

- Full-width calculator layout
- Full-height viewport layout
- No unnecessary page scrolling
- Responsive keypad sizing
- Portrait support
- Landscape support
- Safe-area handling for devices with notches and home indicators
- Large touch targets for comfortable input

## Getting Started

### Requirements

- Node.js
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Then open the URL shown by Vite, normally:

```text
http://localhost:5173
```

### Production Build

```bash
npm run build
```

The production files are generated in `dist/`.

## Project Structure

```text
Calq/
├── public/
│   └── calculator.svg
├── src/
│   ├── main.ts
│   ├── style.css
│   └── vite-env.d.ts
├── index.html
├── package.json
├── README.md
├── .gitignore
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

## Tech Stack

- **TypeScript** — calculator logic and application behavior
- **HTML** — application structure
- **CSS** — calculator styling and responsive layouts
- **Vite** — development server and production bundling

## Design

The interface takes visual inspiration from classic ES-series scientific calculators, including physical-style calculator keys, secondary SHIFT/ALPHA labels, a natural-display-inspired LCD, compact scientific function labels, and traditional scientific-calculator input conventions.

Calq uses its own **CALQ** branding rather than copying the original manufacturer's branding.

## License

Choose and add a license appropriate for your project before publishing, such as the MIT License.

## Status

Calq is an actively developed scientific-calculator web application focused on:

**familiar controls + modern responsive web design.**
