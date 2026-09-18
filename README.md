# Calq

Calq is a responsive scientific calculator for the web, built to combine the familiar interaction patterns of classic natural-display calculators with a fast, touch-friendly browser experience.

> **Trademark notice:** Calq is an independent project. Its visual language is inspired by classic scientific-calculator designs and is not affiliated with, sponsored by, or endorsed by Casio.

## Features

- Classic scientific-calculator-inspired physical key layout
- Natural-display-style LCD with calculator status indicators
- SHIFT and ALPHA modifier states
- DEG, RAD, and GRAD angle modes
- Trigonometric and inverse trigonometric functions
- Hyperbolic functions
- Powers, squares, roots, reciprocal, factorial, permutations, and combinations
- Logarithms and exponential functions
- Fraction input and decimal/fraction display conversion
- Degree-minute-second (DMS) entry and conversion
- Previous-answer (`Ans`) support
- Memory recall/store behavior
- Replay through recent calculations
- Engineering notation
- Power on/off state
- Keyboard input for common operations
- Touch-friendly press feedback
- Full-viewport mobile layouts with safe-area support
- Portrait and landscape phone support

## Calculator Input

### Natural function entry

Function calls can be evaluated without manually entering the closing parenthesis. For example:

```text
sin(30
=
```

Result:

```text
0.5
```

### Powers

Use the power key for arbitrary exponents:

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

For squares:

```text
5
x²
=
```

Result:

```text
25
```

The keyboard `^` key can also be used for powers.

### SHIFT trigonometric functions

Press **SHIFT** before a trigonometric key to use its inverse function:

```text
SHIFT → sin  → sin⁻¹
SHIFT → cos  → cos⁻¹
SHIFT → tan  → tan⁻¹
```

### Degree-minute-second (DMS)

The DMS key supports sexagesimal angle entry using degree, minute, and second symbols.

Example:

```text
2°20′30″
```

The DMS key's SHIFT function converts a decimal angle to degree-minute-second notation.

## Keyboard Controls

| Key | Action |
| --- | --- |
| `0`–`9` | Enter digits |
| `.` / `,` | Decimal point |
| `+` | Addition |
| `-` | Subtraction |
| `*` | Multiplication / SHIFT: nPr |
| `/` | Division / SHIFT: nCr |
| `^` | Power |
| `%` | Percent |
| `(` / `)` | Parentheses |
| `Enter` / `=` | Evaluate |
| `Backspace` | Delete |
| `Escape` | Clear |
| `S` | SHIFT |
| `A` | ALPHA |

## Mobile Experience

Calq is designed for phones first as well as desktop screens. On narrow viewports the calculator occupies the available viewport instead of being presented as a small card inside a scrolling page.

The mobile layout provides: 

- Full-width and full-height presentation
- No unnecessary page scrolling
- Adaptive scientific and numeric keypad sizing
- Portrait and landscape support
- Safe-area handling for notched devices and home indicators
- Large touch targets and brief physical-key press feedback

## Technology

- **TypeScript** — calculator state, input handling, and expression evaluation
- **HTML** — semantic application structure
- **CSS** — calculator shell, display, keypad, and responsive layouts
- **Vite** — development server and production bundling

Calq has no runtime UI framework or component library.

## Project Structure

```text
Calq/
├── public/
│   └── calculator.svg
├── src/
│   ├── main.ts
│   ├── style.css
│   └── vite-env.d.ts
├── .github/
│   └── workflows/
│       └── ci.yml
├── .gitignore
├── index.html
├── package.json
├── README.md
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

## Requirements

- **Node.js 20.19+** (or a later supported LTS release)
- npm
- A current browser with ES module support

Vite 7 requires Node.js 20.19+ or 22.12+; Calq declares Node.js 20.19+ as its minimum runtime. citeturn388232search5

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite prints the local development URL in the terminal. The default is typically `http://localhost:5173`.

## Type Checking

Run the TypeScript project checks without creating a production bundle:

```bash
npm run typecheck
```

## Production Build

Create an optimized production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

The generated application is written to `dist/`.

## Deployment

Calq is a static front-end application. After a successful production build, deploy the contents of `dist/` to any static hosting service that serves HTML, CSS, JavaScript, and static assets.

Common deployment targets include: 

- Cloudflare Pages
- Netlify
- Vercel
- GitHub Pages
- Traditional web servers and static hosting

## CI

A GitHub Actions workflow is included at `.github/workflows/ci.yml`. It installs dependencies, runs the TypeScript checks, and performs a production build on supported Node.js runners.

## Accessibility

The interface uses native buttons, accessible labels, keyboard input, live display updates, touch-friendly controls, and responsive sizing to support different devices and interaction methods.

## Browser Support

Calq targets current releases of:

- Chrome / Chromium
- Microsoft Edge
- Firefox
- Safari

Older browsers may not support every CSS or JavaScript capability used by the application.

## Design

Calq's interface takes inspiration from classic natural-display scientific calculators, including physical-style keys, secondary SHIFT/ALPHA labels, compact scientific functions, and an LCD-inspired display.

The implementation and project branding are original to Calq.

## Contributing

Contributions are welcome. Keep changes focused, preserve mobile usability, and run the following checks before opening a pull request:

```bash
npm run typecheck
npm run build
```

## License

No license is bundled with this repository. Add the license appropriate to the distribution terms you intend to use before publishing Calq for external redistribution.
