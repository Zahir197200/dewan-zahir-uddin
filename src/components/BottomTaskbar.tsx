import { useEffect, useRef, useState } from 'react';
import {
  Banknote,
  Calculator,
  Clock,
  Columns,
  Eye,
  FilePlus2,
  FileSpreadsheet,
  FunctionSquare,
  ImagePlus,
  Images,
  MinusSquare,
  Pencil,
  PlusSquare,
  Printer,
  Type,
  Undo2,
} from 'lucide-react';
import { optimizeUploadedImage } from '../utils/imageOptimizer';
import { toBengaliDigits } from '../utils/formulaEngine';

interface BottomTaskbarProps {
  onScrollToLedger: () => void;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  canUndo: boolean;
  onUndo: () => void;
  onNewSeparateTable: () => void;
  onAddColumn: () => void;
  onAddRow: () => void;
  onRemoveRow: () => void;
  onOpenFormula: () => void;
  onPrint: () => void;
  onPreview: () => void;
  onOpenNoteCounter: () => void;
  onOpenCalculator: () => void;
  onUploadCoverImage: (dataUrl: string) => void;
  onUploadMultiplePosters: (items: { dataUrl: string; title: string }[]) => void;
  onOpenRename: () => void;
}

export function BottomTaskbar({
  onScrollToLedger,
  isEditMode,
  onToggleEditMode,
  canUndo,
  onUndo,
  onNewSeparateTable,
  onAddColumn,
  onAddRow,
  onRemoveRow,
  onOpenFormula,
  onPrint,
  onPreview,
  onOpenNoteCounter,
  onOpenCalculator,
  onUploadCoverImage,
  onUploadMultiplePosters,
  onOpenRename,
}: BottomTaskbarProps) {
  const [now, setNow] = useState(() => new Date());
  const coverInputRef = useRef<HTMLInputElement>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const handleCoverFile = async (file: File | undefined) => {
    if (!file) return;
    const dataUrl = await optimizeUploadedImage(file, 1800, 0.88);
    onUploadCoverImage(dataUrl);
  };

  const handleMultiplePosterFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    const items = await Promise.all(
      files.map(async (file) => ({
        dataUrl: await optimizeUploadedImage(file, 1400, 0.85),
        title: file.name.replace(/\.[^/.]+$/, '') || 'প্রচারমূলক পোস্টার',
      }))
    );
    onUploadMultiplePosters(items);
  };

  const formattedTime = toBengaliDigits(
    now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
  );

  const formattedDate = now.toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const btnBase =
    'inline-flex items-center gap-1.5 h-9 px-2.5 rounded-md text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-400';

  return (
    <div
      role="toolbar"
      aria-label="কম্পিউটার টাস্কবার — সম্পাদনা ও হিসাবের বোতাম"
      className="fixed bottom-0 inset-x-0 z-50 h-13 bg-slate-900 text-slate-100 border-t border-slate-700/90 shadow-lg flex items-center justify-between gap-2 px-2 sm:px-4 print:hidden"
    >
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void handleCoverFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      <input
        ref={posterInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          void handleMultiplePosterFiles(e.target.files);
          e.target.value = '';
        }}
      />

      <div className="flex items-center gap-1.5 overflow-x-auto py-1 flex-1">
        <button
          type="button"
          onClick={onScrollToLedger}
          className={`${btnBase} bg-[#1D4ED8] text-white hover:bg-[#1E40AF]`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
          <span>স্থায়ী হিসাব ঘর</span>
        </button>

        <button
          type="button"
          onClick={onNewSeparateTable}
          className={`${btnBase} bg-slate-800 text-slate-100 hover:bg-slate-700`}
        >
          <FilePlus2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>নতুন হিসাব ঘর</span>
        </button>

        <button
          type="button"
          onClick={onToggleEditMode}
          className={`${btnBase} ${
            isEditMode
              ? 'bg-amber-500 text-slate-950 font-semibold'
              : 'bg-slate-800 text-slate-100 hover:bg-slate-700'
          }`}
        >
          <Pencil className="w-3.5 h-3.5 shrink-0" />
          <span>{isEditMode ? 'সংশোধন চালু' : 'সংশোধন'}</span>
        </button>

        {canUndo && (
          <button
            type="button"
            onClick={onUndo}
            className={`${btnBase} bg-slate-800 text-amber-300 hover:bg-slate-700`}
          >
            <Undo2 className="w-3.5 h-3.5 shrink-0" />
            <span>পূর্বাবস্থা</span>
          </button>
        )}

        <button
          type="button"
          onClick={onAddColumn}
          className={`${btnBase} bg-slate-800 text-slate-100 hover:bg-slate-700`}
        >
          <Columns className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>নতুন কলাম</span>
        </button>

        <button
          type="button"
          onClick={onAddRow}
          className={`${btnBase} bg-slate-800 text-slate-100 hover:bg-slate-700`}
        >
          <PlusSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>ঘর যোগ</span>
        </button>

        <button
          type="button"
          onClick={onRemoveRow}
          className={`${btnBase} bg-slate-800 text-slate-100 hover:bg-slate-700`}
        >
          <MinusSquare className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>ঘর বিয়োগ</span>
        </button>

        <button
          type="button"
          onClick={onOpenFormula}
          className={`${btnBase} bg-slate-800 text-slate-100 hover:bg-slate-700`}
        >
          <FunctionSquare className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>সূত্র এড</span>
        </button>

        <button
          type="button"
          onClick={onOpenNoteCounter}
          className={`${btnBase} bg-slate-800 text-slate-100 hover:bg-slate-700`}
        >
          <Banknote className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>নোট গণনা</span>
        </button>

        <button
          type="button"
          onClick={onOpenCalculator}
          className={`${btnBase} bg-slate-800 text-slate-100 hover:bg-slate-700`}
        >
          <Calculator className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>ক্যালকুলেটর</span>
        </button>

        <button
          type="button"
          onClick={() => coverInputRef.current?.click()}
          className={`${btnBase} bg-slate-800 text-slate-100 hover:bg-slate-700`}
        >
          <ImagePlus className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>কভার ছবি এড</span>
        </button>

        <button
          type="button"
          onClick={() => posterInputRef.current?.click()}
          className={`${btnBase} bg-slate-800 text-slate-100 hover:bg-slate-700`}
        >
          <Images className="w-3.5 h-3.5 text-pink-400 shrink-0" />
          <span>একাধিক পোস্টার এড</span>
        </button>

        <button
          type="button"
          onClick={onOpenRename}
          className={`${btnBase} bg-slate-800 text-slate-100 hover:bg-slate-700`}
        >
          <Type className="w-3.5 h-3.5 text-violet-400 shrink-0" />
          <span>নাম পরিবর্তন</span>
        </button>

        <button
          type="button"
          onClick={onPreview}
          className={`${btnBase} bg-slate-800 text-slate-100 hover:bg-slate-700`}
        >
          <Eye className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span>প্রিভিউ</span>
        </button>

        <button
          type="button"
          onClick={onPrint}
          className={`${btnBase} bg-slate-800 text-slate-100 hover:bg-slate-700`}
        >
          <Printer className="w-3.5 h-3.5 text-slate-200 shrink-0" />
          <span>প্রিন্ট</span>
        </button>
      </div>

      {/* Live Clock Widget */}
      <div
        className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-700 shrink-0 text-right"
        title="বর্তমান সময় ও তারিখ"
      >
        <Clock className="w-4 h-4 text-sky-400 shrink-0" />
        <div className="leading-tight">
          <div className="text-xs font-bold text-white tabular-nums whitespace-nowrap">
            {formattedTime}
          </div>
          <div className="text-[10px] text-slate-400 whitespace-nowrap">
            {formattedDate}
          </div>
        </div>
      </div>
    </div>
  );
}
