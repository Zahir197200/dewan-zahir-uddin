const BENGALI_TO_ENG: Record<string, string> = {
  '০': '0',
  '১': '1',
  '২': '2',
  '৩': '3',
  '৪': '4',
  '৫': '5',
  '৬': '6',
  '৭': '7',
  '৮': '8',
  '৯': '9',
};

const ENG_TO_BENGALI: Record<string, string> = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
};

export function toEnglishDigits(input: string): string {
  return input.replace(/[০-৯]/g, (ch) => BENGALI_TO_ENG[ch] ?? ch);
}

export function toBengaliDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (ch) => ENG_TO_BENGALI[ch] ?? ch);
}

export function parseNumericValue(raw: string | undefined): number {
  if (!raw) return 0;
  const cleaned = toEnglishDigits(raw).replace(/[,৳\s]/g, '');
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
}

export function columnIndexToLetter(index: number): string {
  let letter = '';
  let n = index;
  while (n >= 0) {
    letter = String.fromCharCode((n % 26) + 65) + letter;
    n = Math.floor(n / 26) - 1;
  }
  return letter;
}

function letterToColumnIndex(letters: string): number {
  let idx = 0;
  const upper = letters.toUpperCase();
  for (let i = 0; i < upper.length; i++) {
    idx = idx * 26 + (upper.charCodeAt(i) - 64);
  }
  return idx - 1;
}

export function evaluateCellDisplay(
  rawValue: string | undefined,
  rows: { id: string; cells: Record<string, string> }[],
  columns: { id: string; label: string; type: 'text' | 'number' }[],
  visited: Set<string> = new Set()
): { display: string; numeric: number; isFormula: boolean; hasError: boolean } {
  const val = (rawValue ?? '').trim();
  if (!val.startsWith('=')) {
    const num = parseNumericValue(val);
    return {
      display: val,
      numeric: num,
      isFormula: false,
      hasError: false,
    };
  }

  const exprBody = toEnglishDigits(val.slice(1).trim().toUpperCase());

  const getCellNumber = (colLetter: string, rowNumStr: string): number => {
    const colIdx = letterToColumnIndex(colLetter);
    const rowIdx = parseInt(rowNumStr, 10) - 1;
    if (
      colIdx < 0 ||
      colIdx >= columns.length ||
      rowIdx < 0 ||
      rowIdx >= rows.length
    ) {
      return 0;
    }
    const key = `${colIdx}:${rowIdx}`;
    if (visited.has(key)) return 0;
    visited.add(key);

    const colId = columns[colIdx].id;
    const cellVal = rows[rowIdx].cells[colId];
    return evaluateCellDisplay(cellVal, rows, columns, visited).numeric;
  };

  try {
    // Handle SUM(A1:A5) and AVG(A1:A5)
    let resolved = exprBody.replace(
      /\b(SUM|AVG)\(([A-Z]+)(\d+):([A-Z]+)(\d+)\)/g,
      (_, fn: string, c1: string, r1: string, c2: string, r2: string) => {
        const startCol = Math.min(letterToColumnIndex(c1), letterToColumnIndex(c2));
        const endCol = Math.max(letterToColumnIndex(c1), letterToColumnIndex(c2));
        const startRow = Math.min(parseInt(r1, 10), parseInt(r2, 10)) - 1;
        const endRow = Math.max(parseInt(r1, 10), parseInt(r2, 10)) - 1;

        let sum = 0;
        let count = 0;
        for (let r = startRow; r <= endRow; r++) {
          for (let c = startCol; c <= endCol; c++) {
            if (r >= 0 && r < rows.length && c >= 0 && c < columns.length) {
              sum += getCellNumber(columnIndexToLetter(c), String(r + 1));
              count++;
            }
          }
        }
        const result = fn === 'AVG' && count > 0 ? sum / count : sum;
        return String(result);
      }
    );

    // Replace cell references like B2, C10
    resolved = resolved.replace(/\b([A-Z]+)(\d+)\b/g, (_, col: string, row: string) => {
      return String(getCellNumber(col, row));
    });

    // Safe arithmetic evaluation (only digits, operators, dots, parens, spaces)
    if (!/^[0-9+\-*/().\s]+$/.test(resolved)) {
      return { display: 'ত্রুটি', numeric: 0, isFormula: true, hasError: true };
    }

    const result = Function(`"use strict"; return (${resolved})`)();
    if (typeof result !== 'number' || !Number.isFinite(result)) {
      return { display: 'ত্রুটি', numeric: 0, isFormula: true, hasError: true };
    }

    const rounded = Math.round(result * 100) / 100;
    return {
      display: rounded.toLocaleString('en-US'),
      numeric: rounded,
      isFormula: true,
      hasError: false,
    };
  } catch {
    return { display: 'ত্রুটি', numeric: 0, isFormula: true, hasError: true };
  }
}
