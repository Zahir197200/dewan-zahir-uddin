import { useEffect, useState } from 'react';
import { Calculator as CalcIcon, Delete, X } from 'lucide-react';
import { toBengaliDigits } from '../utils/formulaEngine';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BUTTONS = [
  ['C', '(', ')', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '-'],
  ['1', '2', '3', '+'],
  ['0', '.', '⌫', '='],
];

export function CalculatorModal({ isOpen, onClose }: CalculatorModalProps) {
  const [expr, setExpr] = useState('0');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (/^[0-9.()+\-*/]$/.test(e.key)) {
        e.preventDefault();
        const mapped = e.key === '*' ? '×' : e.key === '/' ? '÷' : e.key;
        handlePress(mapped);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handlePress('=');
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handlePress('⌫');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!isOpen) return null;

  const evaluateExpression = (input: string): string => {
    try {
      const sanitized = input.replace(/×/g, '*').replace(/÷/g, '/');
      if (!/^[0-9+\-*/().\s]+$/.test(sanitized)) return 'ত্রুটি';
      const val = Function(`"use strict"; return (${sanitized})`)();
      if (typeof val !== 'number' || !Number.isFinite(val)) return 'ত্রুটি';
      return String(Math.round(val * 10000) / 10000);
    } catch {
      return 'ত্রুটি';
    }
  };

  const handlePress = (btn: string) => {
    if (btn === 'C') {
      setExpr('0');
      setResult('');
      return;
    }

    if (btn === '⌫') {
      setExpr((prev) => (prev.length <= 1 ? '0' : prev.slice(0, -1)));
      return;
    }

    if (btn === '=') {
      const evaluated = evaluateExpression(expr);
      setResult(evaluated);
      if (evaluated !== 'ত্রুটি') {
        setHistory((prev) => [`${expr} = ${evaluated}`, ...prev].slice(0, 5));
        setExpr(evaluated);
      }
      return;
    }

    setExpr((prev) => {
      if (prev === '0' && /[0-9(]/.test(btn)) return btn;
      return prev + btn;
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-xs print:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="ক্যালকুলেটর"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xs rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <CalcIcon className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold">ক্যালকুলেটর</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="w-7 h-7 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="text-right text-xs text-slate-500 min-h-[18px] truncate tabular-nums">
            {result ? `ফলাফল: ${toBengaliDigits(result)}` : 'হিসাব লিখুন'}
          </div>
          <div className="text-right text-2xl font-bold text-slate-900 mt-1 overflow-x-auto whitespace-nowrap tabular-nums">
            {toBengaliDigits(expr)}
          </div>
        </div>

        <div className="p-3 grid grid-cols-4 gap-2 bg-white">
          {BUTTONS.flat().map((btn) => {
            const isOp = ['÷', '×', '-', '+'].includes(btn);
            const isEq = btn === '=';
            const isClear = btn === 'C';

            return (
              <button
                key={btn}
                type="button"
                onClick={() => handlePress(btn)}
                className={`h-11 rounded-lg text-base font-semibold transition-colors cursor-pointer flex items-center justify-center ${
                  isEq
                    ? 'bg-[#1D4ED8] hover:bg-[#1E40AF] text-white'
                    : isOp
                    ? 'bg-blue-50 hover:bg-blue-100 text-[#1D4ED8]'
                    : isClear
                    ? 'bg-red-50 hover:bg-red-100 text-red-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                }`}
              >
                {btn === '⌫' ? <Delete className="w-4 h-4" /> : btn}
              </button>
            );
          })}
        </div>

        {history.length > 0 && (
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200">
            <div className="text-[11px] font-medium text-slate-500 mb-1">
              পূর্বের হিসাব
            </div>
            <div className="space-y-0.5 max-h-20 overflow-y-auto">
              {history.map((item, idx) => (
                <div
                  key={`${item}-${idx}`}
                  className="text-xs text-slate-600 text-right tabular-nums"
                >
                  {toBengaliDigits(item)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
