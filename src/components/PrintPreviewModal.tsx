import { useState } from 'react';
import { Eye, Printer, X } from 'lucide-react';
import type { LedgerTable, SiteConfig } from '../types/appTypes';
import { evaluateCellDisplay, toBengaliDigits } from '../utils/formulaEngine';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteConfig: SiteConfig;
  activeTable: LedgerTable;
  onPrintTarget: (target: 'ledger' | 'webpage') => void;
}

export function PrintPreviewModal({
  isOpen,
  onClose,
  siteConfig,
  activeTable,
  onPrintTarget,
}: PrintPreviewModalProps) {
  const [previewTab, setPreviewTab] = useState<'ledger' | 'webpage'>('ledger');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs print:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="প্রিন্ট প্রিভিউ"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <Eye className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold">প্রিন্ট প্রিভিউ</h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex bg-slate-800 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setPreviewTab('ledger')}
                className={`px-3 py-1 text-xs font-medium rounded cursor-pointer ${
                  previewTab === 'ledger'
                    ? 'bg-white text-slate-900'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                হিসাব টেবিল প্রিভিউ
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('webpage')}
                className={`px-3 py-1 text-xs font-medium rounded cursor-pointer ${
                  previewTab === 'webpage'
                    ? 'bg-white text-slate-900'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                সম্পূর্ণ ওয়েবপেইজ প্রিভিউ
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                onPrintTarget(previewTab);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>এখনই প্রিন্ট করুন</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="বন্ধ করুন"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Simulated A4 Page */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-100">
          <div className="max-w-3xl mx-auto bg-white border border-slate-200 shadow-sm p-8 sm:p-10 min-h-[500px]">
            <div className="border-b-2 border-slate-900 pb-4 mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {siteConfig.businessName}
                </h2>
                <p className="text-sm font-medium text-[#1D4ED8]">
                  {siteConfig.bankTitle}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {siteConfig.branchLocation} · মোবাইল: {siteConfig.phones.join(', ')}
                </p>
              </div>
              <div className="text-right text-xs text-slate-500">
                <div>তারিখ: {new Date().toLocaleDateString('bn-BD')}</div>
                {previewTab === 'ledger' && (
                  <div className="font-semibold text-slate-800 mt-0.5">
                    হিসাব: {activeTable.name}
                  </div>
                )}
              </div>
            </div>

            {previewTab === 'ledger' ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-300 text-sm">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-300 px-3 py-2 text-left text-xs font-bold text-slate-700 w-10">
                        ক্রম
                      </th>
                      {activeTable.columns.map((col) => (
                        <th
                          key={col.id}
                          className={`border border-slate-300 px-3 py-2 text-xs font-bold text-slate-800 ${
                            col.type === 'number' ? 'text-right' : 'text-left'
                          }`}
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeTable.rows.map((row, rowIndex) => (
                      <tr key={row.id}>
                        <td className="border border-slate-300 px-3 py-2 text-xs text-slate-500 tabular-nums">
                          {toBengaliDigits(rowIndex + 1)}
                        </td>
                        {activeTable.columns.map((col) => {
                          const evalRes = evaluateCellDisplay(
                            row.cells[col.id],
                            activeTable.rows,
                            activeTable.columns
                          );
                          return (
                            <td
                              key={col.id}
                              className={`border border-slate-300 px-3 py-2 tabular-nums ${
                                col.type === 'number'
                                  ? 'text-right font-medium text-slate-900'
                                  : 'text-left text-slate-800'
                              }`}
                            >
                              {evalRes.display}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {siteConfig.heroHeadline}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {siteConfig.heroDescription}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-1.5 mb-3">
                    প্রদত্ত সেবাসমূহ
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {siteConfig.services.map((s) => (
                      <div
                        key={s.id}
                        className="p-3 border border-slate-200 rounded-lg"
                      >
                        <div className="text-sm font-bold text-slate-900">
                          {s.number}. {s.title}
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          {s.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 border border-amber-300 bg-amber-50/60 rounded-lg">
                  <div className="text-sm font-bold text-slate-900">
                    {siteConfig.securityNoticeTitle}
                  </div>
                  <p className="text-xs text-slate-700 mt-1">
                    {siteConfig.securityNoticeBody} {siteConfig.securityNoticeWarning}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-10 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>প্রস্তুতকারক: {siteConfig.businessName}</span>
              <span>স্বাক্ষর ও সীল</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
