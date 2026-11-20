import { useEffect, useState, type FormEvent } from 'react';
import { Type, X } from 'lucide-react';

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
  branchLocation: string;
  activeTableName: string;
  onSave: (data: {
    businessName: string;
    branchLocation: string;
    activeTableName: string;
  }) => void;
}

export function RenameModal({
  isOpen,
  onClose,
  businessName,
  branchLocation,
  activeTableName,
  onSave,
}: RenameModalProps) {
  const [nameDraft, setNameDraft] = useState(businessName);
  const [locationDraft, setLocationDraft] = useState(branchLocation);
  const [tableDraft, setTableDraft] = useState(activeTableName);

  useEffect(() => {
    if (isOpen) {
      setNameDraft(businessName);
      setLocationDraft(branchLocation);
      setTableDraft(activeTableName);
    }
  }, [isOpen, businessName, branchLocation, activeTableName]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({
      businessName: nameDraft.trim() || businessName,
      branchLocation: locationDraft.trim() || branchLocation,
      activeTableName: tableDraft.trim() || activeTableName,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs print:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="নাম পরিবর্তন করুন"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-blue-400" />
            <h3 className="text-base font-bold">নাম পরিবর্তন করুন</h3>
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label
              htmlFor="rename-business"
              className="block text-sm font-medium text-slate-800 mb-1.5"
            >
              ব্যবসা বা প্রতিষ্ঠানের নাম
            </label>
            <input
              id="rename-business"
              type="text"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              className="w-full min-h-[42px] px-3.5 py-2 text-sm text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:border-[#1D4ED8]"
            />
          </div>

          <div>
            <label
              htmlFor="rename-location"
              className="block text-sm font-medium text-slate-800 mb-1.5"
            >
              শাখা / ঠিকানা
            </label>
            <input
              id="rename-location"
              type="text"
              value={locationDraft}
              onChange={(e) => setLocationDraft(e.target.value)}
              className="w-full min-h-[42px] px-3.5 py-2 text-sm text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:border-[#1D4ED8]"
            />
          </div>

          <div>
            <label
              htmlFor="rename-table"
              className="block text-sm font-medium text-slate-800 mb-1.5"
            >
              বর্তমান হিসাব টেবিলের নাম
            </label>
            <input
              id="rename-table"
              type="text"
              value={tableDraft}
              onChange={(e) => setTableDraft(e.target.value)}
              className="w-full min-h-[42px] px-3.5 py-2 text-sm text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:border-[#1D4ED8]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[40px] px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="min-h-[40px] px-5 py-2 text-sm font-medium text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg cursor-pointer"
            >
              পরিবর্তন সংরক্ষণ করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
