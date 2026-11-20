import { useEffect, useState } from 'react';
import { Banknote, Plus, RotateCcw, X } from 'lucide-react';
import { toBengaliDigits } from '../utils/formulaEngine';

interface NoteCounterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertTotalToLedger: (amount: number, summaryText: string) => void;
}

const DENOMINATIONS = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1];

export function NoteCounterModal({
  isOpen,
  onClose,
  onInsertTotalToLedger,
}: NoteCounterModalProps) {
  const [counts, setCounts] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalNotes = DENOMINATIONS.reduce(
    (sum, d) => sum + (parseInt(counts[d] || '0', 10) || 0),
    0
  );

  const grandTotal = DENOMINATIONS.reduce(
    (sum, d) => sum + d * (parseInt(counts[d] || '0', 10) || 0),
    0
  );

  const handleClear = () => setCounts({});

  const handleInsert = () => {
    if (grandTotal <= 0) return;
    const summary = `নোট গণনা (${toBengaliDigits(totalNotes)}টি নোট)`;
    onInsertTotalToLedger(grandTotal, summary);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs print:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="নোট গণনা ক্যালকুলেটর"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <Banknote className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold">নোট গণনা (ক্যাশ কাউন্টার)</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 max-h-[65vh] overflow-y-auto space-y-2.5">
          <div className="grid grid-cols-12 text-xs font-semibold text-slate-500 pb-2 border-b border-slate-200">
            <div className="col-span-4">নোটের মান</div>
            <div className="col-span-4 text-center">নোটের সংখ্যা</div>
            <div className="col-span-4 text-right">মোট টাকা</div>
          </div>

          {DENOMINATIONS.map((denom) => {
            const qty = parseInt(counts[denom] || '0', 10) || 0;
            const subtotal = denom * qty;

            return (
              <div
                key={denom}
                className="grid grid-cols-12 items-center gap-2 py-1"
              >
                <div className="col-span-4 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center min-w-[68px] px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-sm font-bold text-slate-800 tabular-nums">
                    ৳ {toBengaliDigits(denom)}
                  </span>
                  <span className="text-slate-400 text-xs">×</span>
                </div>

                <div className="col-span-4">
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={counts[denom] ?? ''}
                    onChange={(e) =>
                      setCounts((prev) => ({
                        ...prev,
                        [denom]: e.target.value.replace(/[^0-9]/g, ''),
                      }))
                    }
                    placeholder="0"
                    className="w-full h-9 px-3 text-center text-sm font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg tabular-nums focus:outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/15"
                  />
                </div>

                <div className="col-span-4 text-right text-sm font-bold text-slate-900 tabular-nums">
                  ৳ {toBengaliDigits(subtotal.toLocaleString('en-US'))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500">সর্বমোট নোট: {toBengaliDigits(totalNotes)} টি</div>
              <div className="text-sm font-semibold text-slate-700">সর্বমোট টাকা:</div>
            </div>
            <div className="text-2xl font-bold text-[#047857] tabular-nums">
              ৳ {toBengaliDigits(grandTotal.toLocaleString('en-US'))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" />
              <span>রিসেট</span>
            </button>

            <button
              type="button"
              disabled={grandTotal <= 0}
              onClick={handleInsert}
              className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 text-sm font-medium text-white bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:opacity-50 rounded-lg cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>হিসাবের ঘরে যোগ করুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
