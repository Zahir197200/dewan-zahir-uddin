import { useEffect, useState } from 'react';
import { Check, Pencil, X } from 'lucide-react';

interface EditableTextProps {
  value: string;
  isEditMode: boolean;
  onSave: (newValue: string) => void;
  multiline?: boolean;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
  style?: React.CSSProperties;
}

export function EditableText({
  value,
  isEditMode,
  onSave,
  multiline = false,
  className = '',
  as: Tag = 'span',
  style,
}: EditableTextProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (!isEditMode) {
      setEditing(false);
    }
  }, [isEditMode]);

  const handleSave = () => {
    const trimmed = draft.trim();
    if (trimmed) {
      onSave(trimmed);
    } else {
      setDraft(value);
    }
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(value);
    setEditing(false);
  };

  if (isEditMode && editing) {
    return (
      <div className="inline-flex flex-col gap-2 w-full max-w-2xl bg-white border-2 border-[#1D4ED8] rounded-lg p-2.5 shadow-sm z-20">
        {multiline ? (
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            autoFocus
            className="w-full text-sm sm:text-base text-slate-900 bg-slate-50 border border-slate-300 rounded-md p-2 focus:outline-none focus:border-[#1D4ED8]"
          />
        ) : (
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
            autoFocus
            className="w-full text-sm sm:text-base text-slate-900 bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#1D4ED8]"
          />
        )}
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>বাতিল</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>সংরক্ষণ</span>
          </button>
        </div>
      </div>
    );
  }

  if (isEditMode) {
    return (
      <Tag
        onClick={() => setEditing(true)}
        style={style}
        title="সম্পাদনা করতে ক্লিক করুন"
        className={`${className} relative group/edit cursor-pointer outline-2 outline-dashed outline-[#1D4ED8]/50 hover:outline-[#1D4ED8] rounded px-1 -mx-1 transition-colors`}
      >
        {value}
        <span className="inline-flex items-center justify-center ml-1.5 align-middle w-5 h-5 rounded bg-[#1D4ED8] text-white opacity-80 group-hover/edit:opacity-100">
          <Pencil className="w-3 h-3" />
        </span>
      </Tag>
    );
  }

  return (
    <Tag className={className} style={style}>
      {value}
    </Tag>
  );
}
