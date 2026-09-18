import './style.css';

type Action =
  | 'shift' | 'alpha' | 'mode' | 'power' | 'calc' | 'integral' | 'reciprocal' | 'logbase'
  | 'sqrt' | 'square' | 'powerFn' | 'log' | 'ln' | 'negate' | 'angle' | 'hyp'
  | 'sin' | 'cos' | 'tan' | 'rcl' | 'eng' | 'leftParen' | 'rightParen' | 'toggleFraction'
  | 'delete' | 'clear' | 'multiply' | 'divide' | 'add' | 'subtract' | 'decimal' | 'exp'
  | 'answer' | 'equals';

type AngleMode = 'DEG' | 'RAD';

const display = document.querySelector<HTMLDivElement>('#display');
const expression = document.querySelector<HTMLDivElement>('#expression');
const functionGrid = document.querySelector<HTMLDivElement>('#function-grid');
const mainGrid = document.querySelector<HTMLDivElement>('#main-grid');
const replay = document.querySelector<HTMLButtonElement>('#replay');
const themeToggle = document.querySelector<HTMLButtonElement>('#theme-toggle');
const shiftIndicator = document.querySelector<HTMLElement>('#shift-indicator');
const alphaIndicator = document.querySelector<HTMLElement>('#alpha-indicator');
const angleIndicator = document.querySelector<HTMLElement>('#angle-indicator');
const memoryIndicator = document.querySelector<HTMLElement>('#memory-indicator');

if (!display || !expression || !functionGrid || !mainGrid || !replay || !themeToggle || !shiftIndicator || !alphaIndicator || !angleIndicator || !memoryIndicator) {
  throw new Error('Calculator UI failed to initialize.');
}

const ui = {
  display,
  expression,
  functionGrid,
  mainGrid,
  replay,
  themeToggle,
  shiftIndicator,
  alphaIndicator,
  angleIndicator,
  memoryIndicator,
};

let input = '';
let resultText = '0';
let lastAnswer = 0;
let memory = 0;
let shift = false;
let alpha = false;
let angleMode: AngleMode = 'DEG';
let hyperbolic = false;
let fractionMode = false;
let poweredOn = true;
let calculationHistory: string[] = [];
let historyIndex = -1;

const DEG = Math.PI / 180;

function update(): void {
  ui.display.textContent = poweredOn ? resultText : '';
  ui.expression.textContent = poweredOn ? (input || ' ') : 'POWER OFF';
  ui.shiftIndicator.classList.toggle('active', shift);
  ui.alphaIndicator.classList.toggle('active', alpha);
  ui.angleIndicator.textContent = angleMode;
  ui.memoryIndicator.classList.toggle('active', Math.abs(memory) > 0);
  document.querySelector('.calculator')?.classList.toggle('powered-off', !poweredOn);
}

function setMode(mode: 'shift' | 'alpha', value?: boolean): void {
  if (mode === 'shift') shift = value ?? !shift;
  if (mode === 'alpha') alpha = value ?? !alpha;
  if (shift && alpha) alpha = false;
  update();
}

function clearModes(): void {
  shift = false;
  alpha = false;
}

function normalizeExpression(raw: string): string {
  return raw
    .replaceAll('×', '*')
    .replaceAll('÷', '/')
    .replaceAll('−', '-')
    .replaceAll('π', `(${Math.PI})`)
    .replace(/Ans/g, `(${lastAnswer})`)
    .replace(/×10\^/g, 'e')
    .replace(/°/g, '')
    .replace(/√\(/g, 'sqrt(')
    .replace(/∛\(/g, 'cbrt(');
}

function factorial(n: number): number {
  if (!Number.isFinite(n) || n < 0 || Math.floor(n) !== n || n > 170) return Number.NaN;
  let value = 1;
  for (let i = 2; i <= n; i += 1) value *= i;
  return value;
}

function nPr(n: number, r: number): number {
  if (![n, r].every(Number.isFinite) || n < 0 || r < 0 || n < r || !Number.isInteger(n) || !Number.isInteger(r)) return Number.NaN;
  return factorial(n) / factorial(n - r);
}

function nCr(n: number, r: number): number {
  if (![n, r].every(Number.isFinite) || n < 0 || r < 0 || n < r || !Number.isInteger(n) || !Number.isInteger(r)) return Number.NaN;
  return factorial(n) / (factorial(r) * factorial(n - r));
}

function toRadians(value: number): number {
  return angleMode === 'DEG' ? value * DEG : value;
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return 'Math Error';
  if (Math.abs(value) < 1e-12) value = 0;
  const rounded = Number.parseFloat(value.toPrecision(12));
  if (Number.isInteger(rounded) && Math.abs(rounded) < 1e15) return rounded.toLocaleString('en-US', { useGrouping: false });
  return rounded.toString().replace('e+', 'e');
}

function evaluate(raw: string): number {
  const source = normalizeExpression(raw)
    .replace(/\b(asin|acos|atan|sin|cos|tan|sinh|cosh|tanh|log|ln|sqrt|cbrt|abs|fact|pow10|exp10|npr|ncr)\b/g, '$1');

  if (!source || /[^0-9+\-*/().,% eA-Za-z]/.test(source)) throw new Error('Invalid expression');
  if (/[A-Za-z]/.test(source.replace(/(sin|cos|tan|asin|acos|atan|sinh|cosh|tanh|log|ln|sqrt|cbrt|abs|fact|pow10|npr|ncr|e)/g, ''))) {
    throw new Error('Invalid expression');
  }

  const factorialReplaced = source.replace(/(\d+(?:\.\d+)?|\([^()]+\))!/g, (_, token: string) => `fact(${token})`);
  const transformed = factorialReplaced
    .replace(/\^/g, '**')
    .replace(/logb\(([^,()]+),([^()]+)\)/g, '(Math.log($2)/Math.log($1))')
    .replace(/log\(/g, 'log10(')
    .replace(/ln\(/g, 'Math.log(')
    .replace(/sqrt\(/g, 'Math.sqrt(')
    .replace(/cbrt\(/g, 'Math.cbrt(')
    .replace(/abs\(/g, 'Math.abs(')
    .replace(/fact\(/g, 'factorial(')
    .replace(/pow10\(/g, 'Math.pow(10,')
    .replace(/exp10\(/g, 'Math.pow(10,')
    .replace(/npr\(/g, 'nPr(')
    .replace(/ncr\(/g, 'nCr(')
    .replace(/\be\b/g, 'Math.E');

  const fn = Function(
    'factorial', 'nPr', 'nCr', 'log10',
    `"use strict"; return (${transformed});`,
  ) as (factorialFn: typeof factorial, nPrFn: typeof nPr, nCrFn: typeof nCr, log10Fn: (n: number) => number) => number;

  const value = fn(factorial, nPr, nCr, (n) => Math.log10(n));
  return value;
}

function evaluateWithTrig(raw: string): number {
  let source = normalizeExpression(raw);
  const trigNames = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh'];
  for (const name of trigNames) {
    source = source.replaceAll(`${name}(`, `${name}(`);
  }

  // Replace trig functions with numeric wrappers before the generic evaluator.
  const replacements: Array<[RegExp, (n: number) => number]> = [
    [/sin\(([^()]*)\)/g, (n) => Math.sin(toRadians(n))],
    [/cos\(([^()]*)\)/g, (n) => Math.cos(toRadians(n))],
    [/tan\(([^()]*)\)/g, (n) => Math.tan(toRadians(n))],
    [/asin\(([^()]*)\)/g, (n) => angleMode === 'DEG' ? Math.asin(n) / DEG : Math.asin(n)],
    [/acos\(([^()]*)\)/g, (n) => angleMode === 'DEG' ? Math.acos(n) / DEG : Math.acos(n)],
    [/atan\(([^()]*)\)/g, (n) => angleMode === 'DEG' ? Math.atan(n) / DEG : Math.atan(n)],
    [/sinh\(([^()]*)\)/g, (n) => Math.sinh(toRadians(n))],
    [/cosh\(([^()]*)\)/g, (n) => Math.cosh(toRadians(n))],
    [/tanh\(([^()]*)\)/g, (n) => Math.tanh(toRadians(n))],
  ];

  for (const [pattern, operation] of replacements) {
    source = source.replace(pattern, (_match, inner: string) => formatNumber(operation(evaluate(inner))));
  }

  return evaluate(source);
}

function calculate(): void {
  if (!input) return;
  try {
    const value = evaluateWithTrig(input);
    if (!Number.isFinite(value)) throw new Error('Math Error');
    lastAnswer = value;
    resultText = fractionMode ? decimalToFraction(value) : formatNumber(value);
    calculationHistory.unshift(`${input} = ${resultText}`);
    calculationHistory = calculationHistory.slice(0, 30);
    input = resultText;
    historyIndex = -1;
    clearModes();
    update();
  } catch {
    resultText = 'Math Error';
    update();
  }
}

function decimalToFraction(value: number): string {
  if (!Number.isFinite(value)) return 'Math Error';
  const sign = value < 0 ? -1 : 1;
  let x = Math.abs(value);
  if (Number.isInteger(x)) return `${sign * x}`;

  let bestNum = Math.round(x);
  let bestDen = 1;
  let bestError = Math.abs(x - bestNum);
  for (let den = 1; den <= 1000; den += 1) {
    const num = Math.round(x * den);
    const error = Math.abs(x - num / den);
    if (error < bestError) {
      bestNum = num;
      bestDen = den;
      bestError = error;
    }
  }
  return `${sign * bestNum}/${bestDen}`;
}

function insert(value: string): void {
  if (!poweredOn) return;
  if (resultText === 'Math Error') {
    input = '';
    resultText = '0';
  }
  input += value;
  resultText = input || '0';
  update();
}

function unary(prefix: string, suffix = ')'): void {
  if (!poweredOn) return;
  const current = input || '0';
  input = `${prefix}${current}${suffix}`;
  resultText = input;
  update();
}

function handleScientific(action: Action): void {
  const useShift = shift;
  hyperbolic = action === 'hyp' ? !hyperbolic : hyperbolic;

  switch (action) {
    case 'calc': calculate(); break;
    case 'integral':
      resultText = 'Use: ∫ f(x) dx';
      update();
      break;
    case 'reciprocal':
      if (useShift) unary('', '!');
      else unary('1/(', ')');
      break;
    case 'logbase':
      if (useShift) unary('sqrt(', ')');
      else insert('logb(');
      break;
    case 'sqrt':
      unary(useShift ? 'cbrt(' : 'sqrt(');
      break;
    case 'square':
      unary('', useShift ? '^3' : '^2');
      break;
    case 'powerFn':
      if (useShift) unary('', '^-1');
      else insert('^');
      break;
    case 'log':
      if (useShift) unary('pow10(');
      else insert('log(');
      break;
    case 'ln':
      if (useShift) unary('exp10(');
      else insert('ln(');
      break;
    case 'negate': unary('-(', ')'); break;
    case 'angle':
      if (useShift) {
        angleMode = angleMode === 'DEG' ? 'RAD' : 'DEG';
        update();
      } else {
        insert('°');
      }
      break;
    case 'hyp':
      update();
      break;
    case 'sin': unary(`${useShift ? 'asin' : hyperbolic ? 'sinh' : 'sin'}(`); break;
    case 'cos': unary(`${useShift ? 'acos' : hyperbolic ? 'cosh' : 'cos'}(`); break;
    case 'tan': unary(`${useShift ? 'atan' : hyperbolic ? 'tanh' : 'tan'}(`); break;
    case 'rcl':
      if (useShift) memory = evaluateSafe(input);
      else insert(memory.toString());
      update();
      break;
    case 'eng':
      if (!input) return;
      resultText = formatEngineering(evaluateSafe(input));
      input = resultText;
      clearModes();
      update();
      break;
    case 'leftParen': insert('('); break;
    case 'rightParen': insert(')'); break;
    case 'toggleFraction':
      fractionMode = !fractionMode;
      if (input) {
        const value = evaluateSafe(input);
        resultText = fractionMode ? decimalToFraction(value) : formatNumber(value);
      }
      update();
      break;
    default:
      break;
  }

  clearModes();
  update();
}

function evaluateSafe(value: string): number {
  try {
    return evaluateWithTrig(value);
  } catch {
    return 0;
  }
}

function formatEngineering(value: number): string {
  if (!Number.isFinite(value) || value === 0) return String(value);
  const exponent = Math.floor(Math.log10(Math.abs(value)) / 3) * 3;
  const coefficient = value / (10 ** exponent);
  return `${Number.parseFloat(coefficient.toPrecision(9))}e${exponent}`;
}

function handleAction(action: Action): void {
  if (action === 'power') {
    poweredOn = !poweredOn;
    clearModes();
    update();
    return;
  }
  if (!poweredOn) return;

  if (action === 'shift') { setMode('shift'); return; }
  if (action === 'alpha') { setMode('alpha'); return; }
  if (action === 'mode') {
    angleMode = angleMode === 'DEG' ? 'RAD' : 'DEG';
    update();
    return;
  }

  if (action === 'clear') {
    input = '';
    resultText = '0';
    historyIndex = -1;
    clearModes();
    update();
    return;
  }

  if (action === 'delete') {
    input = input.slice(0, -1);
    resultText = input || '0';
    update();
    return;
  }

  if (action === 'multiply') insert(shift ? 'nPr(' : '×');
  else if (action === 'divide') insert(shift ? 'nCr(' : '÷');
  else if (action === 'add') insert('+');
  else if (action === 'subtract') insert('−');
  else if (action === 'decimal') insert(shift ? 'π' : '.');
  else if (action === 'exp') insert(shift ? 'e' : '×10^');
  else if (action === 'answer') insert('Ans');
  else if (action === 'equals') calculate();
  else handleScientific(action);
}

function bindGrid(grid: HTMLElement): void {
  grid.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]');
    if (!button) return;
    button.classList.remove('pressed');
    void button.offsetWidth;
    button.classList.add('pressed');
    handleAction(button.dataset.action as Action);
  });

  grid.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-digit]');
    if (!button) return;
    const digit = button.dataset.digit;
    if (digit) insert(digit);
  });
}

bindGrid(functionGrid);
bindGrid(mainGrid);

themeToggle.addEventListener('click', () => {
  document.documentElement.classList.toggle('light-display');
});

replay.addEventListener('click', (event) => {
  const rect = replay.getBoundingClientRect();
  const x = (event as MouseEvent).clientX - rect.left - rect.width / 2;
  const y = (event as MouseEvent).clientY - rect.top - rect.height / 2;
  if (Math.abs(x) > Math.abs(y)) {
    historyIndex = Math.max(0, Math.min(calculationHistory.length - 1, historyIndex + (x < 0 ? 1 : -1)));
  } else if (Math.abs(y) > 10) {
    historyIndex = Math.max(0, Math.min(calculationHistory.length - 1, historyIndex + (y < 0 ? 1 : -1)));
  }
  if (calculationHistory[historyIndex]) {
    input = calculationHistory[historyIndex].split(' = ')[0] ?? '';
    resultText = input || '0';
    update();
  }
});

window.addEventListener('keydown', (event) => {
  const { key } = event;
  if (/^[0-9]$/.test(key)) {
    event.preventDefault();
    insert(key);
    return;
  }
  if (key === '.') { event.preventDefault(); insert('.'); return; }
  if (key === 'Enter' || key === '=') { event.preventDefault(); handleAction('equals'); return; }
  if (key === 'Escape' || key.toLowerCase() === 'c') { event.preventDefault(); handleAction('clear'); return; }
  if (key === 'Backspace') { event.preventDefault(); handleAction('delete'); return; }
  const map: Record<string, Action> = {
    '+': 'add', '-': 'subtract', '*': 'multiply', '/': 'divide',
    '^': 'power', '(': 'leftParen', ')': 'rightParen', '%': 'toggleFraction',
  };
  if (map[key]) { event.preventDefault(); handleAction(map[key]); return; }
  if (key.toLowerCase() === 's') { event.preventDefault(); handleAction('shift'); return; }
  if (key.toLowerCase() === 'a') { event.preventDefault(); handleAction('answer'); }
});

update();
