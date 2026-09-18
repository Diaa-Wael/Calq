import './style.css';

type Action =
  | 'shift' | 'alpha' | 'mode' | 'power' | 'calc' | 'integral' | 'reciprocal' | 'root'
  | 'logbase' | 'fraction' | 'sqrt' | 'square' | 'powerFn' | 'log' | 'ln' | 'negate'
  | 'angle' | 'hyp' | 'sin' | 'cos' | 'tan' | 'rcl' | 'eng' | 'leftParen' | 'rightParen'
  | 'pi' | 'constant' | 'percent' | 'toggleFraction' | 'delete' | 'clear' | 'multiply'
  | 'divide' | 'add' | 'subtract' | 'decimal' | 'exp' | 'answer' | 'equals' | 'zero';

type AngleMode = 'DEG' | 'RAD' | 'GRAD';

const $ = <T extends Element>(selector: string) => document.querySelector<T>(selector);

const display = $('#display') as HTMLDivElement;
const expressionEl = $('#expression') as HTMLDivElement;
const scientificGrid = $('#scientific-grid') as HTMLDivElement;
const numberGrid = $('#number-grid') as HTMLDivElement;
const replay = $('#replay') as HTMLButtonElement;
const shiftIndicator = $('#shift-indicator') as HTMLSpanElement;
const alphaIndicator = $('#alpha-indicator') as HTMLSpanElement;
const angleIndicator = $('#angle-indicator') as HTMLSpanElement;
const memoryIndicator = $('#memory-indicator') as HTMLSpanElement;

if (!display || !expressionEl || !scientificGrid || !numberGrid || !replay || !shiftIndicator || !alphaIndicator || !angleIndicator || !memoryIndicator) {
  throw new Error('Calq UI failed to initialize.');
}

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
let history: string[] = [];
let historyIndex = -1;
let justCalculated = false;

const DEG = Math.PI / 180;
const GRAD = Math.PI / 200;

function update(): void {
  expressionEl.textContent = poweredOn ? (input || '0') : 'POWER OFF';
  display.textContent = poweredOn ? resultText : '';
  shiftIndicator.classList.toggle('active', shift);
  alphaIndicator.classList.toggle('active', alpha);
  angleIndicator.textContent = angleMode;
  memoryIndicator.classList.toggle('active', Math.abs(memory) > Number.EPSILON);
  document.documentElement.classList.toggle('powered-off', !poweredOn);
}

function clearModes(): void {
  shift = false;
  alpha = false;
}

function prepareInput(): void {
  if (!poweredOn) return;
  if (justCalculated) {
    input = '';
    resultText = '0';
    justCalculated = false;
  }
}

function insert(text: string): void {
  if (!poweredOn) return;
  prepareInput();
  input += text;
  resultText = input || '0';
  update();
}

function replaceCurrentWith(text: string): void {
  if (!poweredOn) return;
  input = text;
  resultText = text || '0';
  update();
}

function lastNumericToken(): string {
  const match = input.match(/(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i);
  return match?.[0] ?? '';
}

function applyPostfix(postfix: string): void {
  if (!poweredOn) return;
  prepareInput();
  const token = lastNumericToken();
  if (!token) {
    input += postfix;
  } else {
    input = `${input.slice(0, -token.length)}${token}${postfix}`;
  }
  resultText = input || '0';
  update();
}

function wrapUnary(fn: string): void {
  if (!poweredOn) return;
  prepareInput();
  const token = lastNumericToken();
  if (token) {
    input = `${input.slice(0, -token.length)}${fn}(${token})`;
  } else {
    input += `${fn}(`;
  }
  resultText = input;
  update();
}

function appendPower(power = '^'): void {
  if (!poweredOn) return;
  prepareInput();
  const token = lastNumericToken();
  if (!token && !input.endsWith(')')) {
    input += power;
  } else {
    input += power;
  }
  resultText = input;
  update();
}

function toggleMode(action: 'shift' | 'alpha'): void {
  if (action === 'shift') shift = !shift;
  else alpha = !alpha;
  if (shift && alpha) alpha = false;
  update();
}

function toRadians(value: number): number {
  if (angleMode === 'DEG') return value * DEG;
  if (angleMode === 'GRAD') return value * GRAD;
  return value;
}

function fromRadians(value: number): number {
  if (angleMode === 'DEG') return value / DEG;
  if (angleMode === 'GRAD') return value / GRAD;
  return value;
}

function factorial(n: number): number {
  if (!Number.isInteger(n) || n < 0 || n > 170) throw new Error('Math Error');
  let result = 1;
  for (let i = 2; i <= n; i += 1) result *= i;
  return result;
}

function nPr(n: number, r: number): number {
  if (!Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0 || r > n) throw new Error('Math Error');
  return factorial(n) / factorial(n - r);
}

function nCr(n: number, r: number): number {
  if (!Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0 || r > n) throw new Error('Math Error');
  return factorial(n) / (factorial(r) * factorial(n - r));
}

function isIdentifierStart(char: string): boolean {
  return /[A-Za-z]/.test(char);
}

class Parser {
  private index = 0;
  constructor(private readonly source: string) {}

  parse(): number {
    const value = this.parseExpression();
    this.skipSpaces();
    if (this.index < this.source.length) throw new Error('Syntax Error');
    return value;
  }

  private skipSpaces(): void {
    while (this.source[this.index] === ' ') this.index += 1;
  }

  private match(text: string): boolean {
    this.skipSpaces();
    if (this.source.slice(this.index, this.index + text.length) === text) {
      this.index += text.length;
      return true;
    }
    return false;
  }

  private parseExpression(): number {
    let value = this.parseTerm();
    while (true) {
      if (this.match('+')) value += this.parseTerm();
      else if (this.match('−') || this.match('-')) value -= this.parseTerm();
      else return value;
    }
  }

  private parseTerm(): number {
    let value = this.parseUnary();
    while (true) {
      if (this.match('×') || this.match('*')) value *= this.parseUnary();
      else if (this.match('÷') || this.match('/')) value /= this.parseUnary();
      else if (this.match('%')) value %= this.parseUnary();
      else if (this.isImplicitMultiplication()) value *= this.parseUnary();
      else return value;
    }
  }

  private isImplicitMultiplication(): boolean {
    this.skipSpaces();
    const char = this.source[this.index] ?? '';
    return char === '(' || char === 'π' || char === 'e' || isIdentifierStart(char) || /\d/.test(char);
  }

  private parseUnary(): number {
    if (this.match('+')) return this.parseUnary();
    if (this.match('−') || this.match('-')) return -this.parseUnary();
    return this.parsePower();
  }

  private parsePower(): number {
    let base = this.parsePostfix();
    if (this.match('^')) {
      const exponent = this.parseUnary();
      base = base ** exponent;
    }
    return base;
  }

  private parsePostfix(): number {
    let value = this.parsePrimary();
    while (true) {
      if (this.match('²')) value = value ** 2;
      else if (this.match('³')) value = value ** 3;
      else if (this.match('!')) value = factorial(value);
      else return value;
    }
  }

  private parsePrimary(): number {
    this.skipSpaces();
    if (this.match('(')) {
      const value = this.parseExpression();
      if (!this.match(')')) throw new Error('Syntax Error');
      return value;
    }

    const char = this.source[this.index] ?? '';
    if (/[0-9.]/.test(char)) return this.parseNumber();
    if (char === 'π') {
      this.index += 1;
      return Math.PI;
    }
    if (this.source.slice(this.index, this.index + 2) === 'Ans') {
      this.index += 3;
      return lastAnswer;
    }
    if (char === 'e') {
      this.index += 1;
      return Math.E;
    }
    if (isIdentifierStart(char)) return this.parseFunction();
    throw new Error('Syntax Error');
  }

  private parseNumber(): number {
    this.skipSpaces();
    const rest = this.source.slice(this.index);
    const match = rest.match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/);
    if (!match) throw new Error('Syntax Error');
    this.index += match[0].length;
    return Number(match[0]);
  }

  private parseIdentifier(): string {
    const start = this.index;
    while (/[A-Za-z0-9]/.test(this.source[this.index] ?? '')) this.index += 1;
    return this.source.slice(start, this.index);
  }

  private parseFunction(): number {
    const name = this.parseIdentifier();
    const normalized = name.toLowerCase();
    if (normalized === 'ans') return lastAnswer;
    if (normalized === 'pi') return Math.PI;
    if (!this.match('(')) throw new Error('Syntax Error');
    const arg = this.parseExpression();
    let second: number | undefined;
    if (this.match(',')) second = this.parseExpression();
    if (!this.match(')')) throw new Error('Syntax Error');

    switch (normalized) {
      case 'sin': return hyperbolic ? Math.sinh(toRadians(arg)) : Math.sin(toRadians(arg));
      case 'cos': return hyperbolic ? Math.cosh(toRadians(arg)) : Math.cos(toRadians(arg));
      case 'tan': return hyperbolic ? Math.tanh(toRadians(arg)) : Math.tan(toRadians(arg));
      case 'asin': return fromRadians(Math.asin(arg));
      case 'acos': return fromRadians(Math.acos(arg));
      case 'atan': return fromRadians(Math.atan(arg));
      case 'asinh': return fromRadians(Math.asinh(arg));
      case 'acosh': return fromRadians(Math.acosh(arg));
      case 'atanh': return fromRadians(Math.atanh(arg));
      case 'sqrt': return Math.sqrt(arg);
      case 'cbrt': return Math.cbrt(arg);
      case 'abs': return Math.abs(arg);
      case 'ln': return Math.log(arg);
      case 'log': return Math.log10(arg);
      case 'logb': return second === undefined ? Math.log10(arg) : Math.log(arg) / Math.log(second);
      case 'exp': return Math.exp(arg);
      case 'pow10': return 10 ** arg;
      case 'factorial': return factorial(arg);
      case 'npr': if (second === undefined) throw new Error('Math Error'); return nPr(arg, second);
      case 'ncr': if (second === undefined) throw new Error('Math Error'); return nCr(arg, second);
      default: throw new Error('Unknown function');
    }
  }
}

function normalizeRawExpression(raw: string): string {
  return raw
    .replaceAll('×', '*')
    .replaceAll('÷', '/')
    .replaceAll('−', '-')
    .replaceAll('²', '^2')
    .replaceAll('³', '^3')
    .replace(/Ans/g, 'Ans');
}

function evaluate(raw: string): number {
  const source = normalizeRawExpression(raw).replaceAll('*', '×').replaceAll('/', '÷');
  const value = new Parser(source).parse();
  if (!Number.isFinite(value)) throw new Error('Math Error');
  return value;
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return 'Math Error';
  if (Object.is(value, -0)) value = 0;
  if (Math.abs(value) < 1e-12) value = 0;
  const rounded = Number.parseFloat(value.toPrecision(12));
  if (Number.isInteger(rounded) && Math.abs(rounded) < 1e15) return String(rounded);
  return rounded.toString().replace('e+', 'e');
}

function decimalToFraction(value: number): string {
  if (!Number.isFinite(value)) return 'Math Error';
  const sign = value < 0 ? -1 : 1;
  let x = Math.abs(value);
  if (Number.isInteger(x)) return String(sign * x);
  let bestNum = 0;
  let bestDen = 1;
  let bestError = Infinity;
  for (let den = 1; den <= 999; den += 1) {
    const num = Math.round(x * den);
    const error = Math.abs(x - num / den);
    if (error < bestError) {
      bestNum = num;
      bestDen = den;
      bestError = error;
    }
    if (bestError < 1e-10) break;
  }
  return `${sign * bestNum}/${bestDen}`;
}

function engineering(value: number): string {
  if (!Number.isFinite(value) || value === 0) return String(value);
  const exponent = Math.floor(Math.log10(Math.abs(value)) / 3) * 3;
  const coefficient = value / 10 ** exponent;
  return `${formatNumber(coefficient)}e${exponent >= 0 ? '+' : ''}${exponent}`;
}

function calculate(): void {
  if (!input) return;
  try {
    const value = evaluate(input);
    lastAnswer = value;
    resultText = fractionMode ? decimalToFraction(value) : formatNumber(value);
    history.unshift(`${input} = ${resultText}`);
    history = history.slice(0, 20);
    input = resultText;
    justCalculated = true;
    historyIndex = -1;
    clearModes();
    update();
  } catch {
    resultText = 'Math Error';
    justCalculated = false;
    update();
  }
}

function safeValue(): number {
  try {
    return evaluate(input);
  } catch {
    return 0;
  }
}

function handleScientific(action: Action): void {
  const useShift = shift;

  switch (action) {
    case 'calc':
      calculate();
      break;
    case 'integral':
      replaceCurrentWith('∫(');
      break;
    case 'reciprocal':
      if (useShift) applyPostfix('!');
      else {
        const token = lastNumericToken();
        if (token) replaceCurrentWith(`${input.slice(0, -token.length)}1/(${token})`);
        else insert('1/(');
      }
      break;
    case 'root':
      wrapUnary(useShift ? 'cbrt' : 'sqrt');
      break;
    case 'logbase':
      if (useShift) wrapUnary('pow10');
      else insert('logb(');
      break;
    case 'fraction':
      insert('/');
      break;
    case 'sqrt':
      wrapUnary(useShift ? 'cbrt' : 'sqrt');
      break;
    case 'square':
      applyPostfix(useShift ? '³' : '²');
      break;
    case 'powerFn':
      if (useShift) {
        const token = lastNumericToken();
        if (token) replaceCurrentWith(`${input.slice(0, -token.length)}sqrt(${token})`);
        else insert('sqrt(');
      } else {
        appendPower();
      }
      break;
    case 'log':
      wrapUnary(useShift ? 'pow10' : 'log');
      break;
    case 'ln':
      wrapUnary(useShift ? 'exp' : 'ln');
      break;
    case 'negate':
      wrapUnary('−');
      break;
    case 'angle':
      if (useShift) {
        angleMode = angleMode === 'DEG' ? 'RAD' : angleMode === 'RAD' ? 'GRAD' : 'DEG';
      } else {
        applyPostfix('°');
      }
      break;
    case 'hyp':
      hyperbolic = !hyperbolic;
      break;
    case 'sin':
      wrapUnary(useShift ? 'asin' : 'sin');
      break;
    case 'cos':
      wrapUnary(useShift ? 'acos' : 'cos');
      break;
    case 'tan':
      wrapUnary(useShift ? 'atan' : 'tan');
      break;
    case 'rcl':
      if (useShift) memory = safeValue();
      else insert(formatNumber(memory));
      break;
    case 'eng':
      resultText = engineering(safeValue());
      input = resultText;
      justCalculated = true;
      break;
    case 'leftParen': insert('('); break;
    case 'rightParen': insert(')'); break;
    case 'pi': insert(useShift ? 'e' : 'π'); break;
    case 'constant': insert('e'); break;
    case 'percent': applyPostfix('%'); break;
    case 'toggleFraction':
      fractionMode = !fractionMode;
      if (input) {
        const value = safeValue();
        resultText = fractionMode ? decimalToFraction(value) : formatNumber(value);
        if (justCalculated) input = resultText;
      }
      break;
    default: break;
  }
  clearModes();
  update();
}

function handleAction(action: Action): void {
  if (action === 'power') {
    poweredOn = !poweredOn;
    clearModes();
    justCalculated = false;
    update();
    return;
  }

  if (!poweredOn) return;

  if (action === 'shift' || action === 'alpha') {
    toggleMode(action);
    return;
  }

  if (action === 'mode') {
    angleMode = angleMode === 'DEG' ? 'RAD' : angleMode === 'RAD' ? 'GRAD' : 'DEG';
    update();
    return;
  }

  if (action === 'clear') {
    input = '';
    resultText = '0';
    justCalculated = false;
    clearModes();
    update();
    return;
  }

  if (action === 'delete') {
    prepareInput();
    input = input.slice(0, -1);
    resultText = input || '0';
    update();
    return;
  }

  if (action === 'multiply') insert(shift ? 'npr(' : '×');
  else if (action === 'divide') insert(shift ? 'ncr(' : '÷');
  else if (action === 'add') insert('+');
  else if (action === 'subtract') insert('−');
  else if (action === 'decimal') insert('.');
  else if (action === 'exp') insert('e');
  else if (action === 'answer') insert('Ans');
  else if (action === 'equals') calculate();
  else if (action === 'zero') insert('0');
  else handleScientific(action);
}

function bindGrid(grid: HTMLElement): void {
  grid.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-action],button[data-digit]');
    if (!button) return;
    button.classList.remove('pressed');
    void button.offsetWidth;
    button.classList.add('pressed');

    const action = button.dataset.action as Action | undefined;
    const digit = button.dataset.digit;
    if (action) handleAction(action);
    else if (digit) insert(digit);
  });
}

bindGrid(scientificGrid);
bindGrid(numberGrid);

replay.addEventListener('click', (event) => {
  if (history.length === 0) return;
  const rect = replay.getBoundingClientRect();
  const x = (event as MouseEvent).clientX - rect.left - rect.width / 2;
  const y = (event as MouseEvent).clientY - rect.top - rect.height / 2;
  if (Math.abs(x) > Math.abs(y)) historyIndex += x < 0 ? 1 : -1;
  else historyIndex += y < 0 ? 1 : -1;
  historyIndex = Math.max(0, Math.min(history.length - 1, historyIndex));
  const entry = history[historyIndex];
  if (entry) {
    input = entry.split(' = ')[0] ?? '';
    resultText = input || '0';
    justCalculated = false;
    update();
  }
});

window.addEventListener('keydown', (event) => {
  const key = event.key;
  if (/^[0-9]$/.test(key)) {
    event.preventDefault();
    insert(key);
    return;
  }
  const directMap: Record<string, Action> = {
    '.': 'decimal', ',': 'decimal', '+': 'add', '-': 'subtract', '*': 'multiply', '/': 'divide',
    '^': 'powerFn', '%': 'percent', '(': 'leftParen', ')': 'rightParen',
    Enter: 'equals', '=': 'equals', Backspace: 'delete', Escape: 'clear',
  };
  if (directMap[key]) {
    event.preventDefault();
    handleAction(directMap[key]);
    return;
  }
  const lower = key.toLowerCase();
  const letterMap: Record<string, Action> = { s: 'shift', a: 'alpha' };
  if (letterMap[lower]) {
    event.preventDefault();
    handleAction(letterMap[lower]);
  }
});

update();
