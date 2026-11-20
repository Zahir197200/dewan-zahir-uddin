import { useRef, useState } from 'react';
import { Check, Images, ShieldCheck, Trash2, X } from 'lucide-react';
import type { PosterItem, SiteConfig } from '../types/appTypes';
import { optimizeUploadedImage } from '../utils/imageOptimizer';
import { EditableText } from './EditableText';
import { ResilientImage } from './ResilientImage';

interface PosterGallerySectionProps {
  config: SiteConfig;
  isEditMode: boolean;
  onUpdateField: <K extends keyof SiteConfig>(field: K, value: SiteConfig[K]) => void;
  onUploadMultiplePosters: (items: { dataUrl: string; title: string }[]) => void;
  onRemovePoster: (id: string) => void;
  onUpdatePosterTitle: (id: string, title: string) => void;
}

const ACCENT_MAP: Record<
  PosterItem['accentColor'],
  { topBar: string; label: string }
> = {
  navy: { topBar: 'bg-[#0F2942]', label: 'text-[#1D4ED8]' },
  red: { topBar: 'bg-[#C8102E]', label: 'text-[#C8102E]' },
  green: { topBar: 'bg-[#047857]', label: 'text-[#047857]' },
  purple: { topBar: 'bg-[#5B21B6]', label: 'text-[#5B21B6]' },
};

export function PosterGallerySection({
  config,
  isEditMode,
  onUpdateField,
  onUploadMultiplePosters,
  onRemovePoster,
  onUpdatePosterTitle,
}: PosterGallerySectionProps) {
  const posterInputRef = useRef<HTMLInputElement>(null);
  const [zoomedPoster, setZoomedPoster] = useState<PosterItem | null>(null);

  const handlePosterFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    const results = await Promise.all(
      files.map(async (file) => {
        const dataUrl = await optimizeUploadedImage(file, 1400, 0.85);
        return {
          dataUrl,
          title: file.name.replace(/\.[^/.]+$/, '') || 'প্রচারমূলক পোস্টার',
        };
      })
    );
    onUploadMultiplePosters(results);
  };

  return (
    <>
      <section
        id="posters"
        className="py-16 sm:py-20 bg-white border-y border-slate-200/80"
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-[#C8102E] mb-2">
                অফিসিয়াল তথ্য ও পোস্টার গ্যালারি
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F2942] tracking-tight leading-tight">
                লেনদেন চার্জ, লোন অফার ও সেবার পোস্টারসমূহ
              </h2>
            </div>

            <div className="print:hidden">
              <input
                ref={posterInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  void handlePosterFiles(e.target.files);
                  e.target.value = '';
                }}
              />
              <button
                type="button"
                onClick={() => posterInputRef.current?.click()}
                className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 text-sm font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg cursor-pointer whitespace-nowrap"
              >
                <Images className="w-4 h-4" />
                <span>একাধিক পোস্টার এড করুন</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {config.posters.map((poster) => {
              const accent = ACCENT_MAP[poster.accentColor] || ACCENT_MAP.navy;

              return (
                <article
                  key={poster.id}
                  className="relative rounded-xl border border-slate-200 bg-[#F8FAFC]/60 overflow-hidden flex flex-col justify-between"
                >
                  <div className={`h-1.5 w-full ${accent.topBar}`} />

                  {isEditMode && (
                    <button
                      type="button"
                      onClick={() => onRemovePoster(poster.id)}
                      title="পোস্টার মুছুন"
                      className="absolute top-4 right-4 z-10 w-8 h-8 rounded-lg bg-white border border-slate-200 text-red-600 hover:bg-red-50 flex items-center justify-center shadow-xs cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  {poster.customImage ? (
                    <div className="flex flex-col h-full">
                      <button
                        type="button"
                        onClick={() => setZoomedPoster(poster)}
                        className="aspect-[3/4] w-full bg-slate-100 overflow-hidden border-b border-slate-200 cursor-zoom-in block"
                      >
                        <ResilientImage
                          src={poster.customImage}
                          alt={poster.title}
                          fallbackTitle={poster.title}
                          className="w-full h-full object-contain bg-white"
                        />
                      </button>
                      <div className="p-4 bg-white">
                        <EditableText
                          as="div"
                          value={poster.title}
                          isEditMode={isEditMode}
                          onSave={(val) => onUpdatePosterTitle(poster.id, val)}
                          className="text-sm font-bold text-slate-900"
                        />
                        <div className="text-xs text-slate-500 mt-0.5">
                          {poster.subtitle}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 sm:p-7 flex flex-col flex-1 justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-semibold mb-2">
                          <span className={accent.label}>{poster.badgeText}</span>
                          <span aria-hidden="true" className="text-slate-300">
                            ·
                          </span>
                          <span className="text-slate-500">
                            {config.businessName}
                          </span>
                        </div>

                        <EditableText
                          as="h3"
                          value={poster.title}
                          isEditMode={isEditMode}
                          onSave={(val) => onUpdatePosterTitle(poster.id, val)}
                          className="text-xl font-bold text-[#0F2942] leading-snug mb-1.5 block"
                        />
                        <p className="text-xs text-slate-500 mb-5">
                          {poster.subtitle}
                        </p>

                        <ul className="space-y-2.5 mb-6">
                          {poster.points.map((pt) => (
                            <li
                              key={pt}
                              className="flex items-start gap-2.5 text-sm text-slate-700"
                            >
                              <Check className="w-4 h-4 text-[#047857] shrink-0 mt-0.5" />
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-4 border-t border-slate-200 text-xs font-medium text-slate-600 tabular-nums">
                        {poster.footerNote}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Poster Fullscreen Zoom Modal */}
      {zoomedPoster?.customImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs print:hidden"
          onClick={() => setZoomedPoster(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-white rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <span className="text-sm font-bold text-slate-900">
                {zoomedPoster.title}
              </span>
              <button
                type="button"
                onClick={() => setZoomedPoster(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[80vh] overflow-auto bg-slate-50 p-4 flex justify-center">
              <img
                src={zoomedPoster.customImage}
                alt={zoomedPoster.title}
                referrerPolicy="no-referrer"
                className="max-h-[72vh] w-auto object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}

      {/* Customer Security & Receipt Verification Notice */}
      <section
        id="security"
        className="py-14 sm:py-16 bg-[#F8FAFC] border-b border-slate-200/80"
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-slate-300 bg-white p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-[#047857] mb-3">
                <ShieldCheck className="w-5 h-5" />
                <span>নিরাপদ ব্যাংকিং নির্দেশিকা</span>
              </div>

              <EditableText
                as="h3"
                value={config.securityNoticeTitle}
                isEditMode={isEditMode}
                onSave={(val) => onUpdateField('securityNoticeTitle', val)}
                className="text-xl sm:text-2xl font-bold text-[#0F2942] mb-3 block"
              />

              <EditableText
                as="p"
                value={config.securityNoticeBody}
                isEditMode={isEditMode}
                onSave={(val) => onUpdateField('securityNoticeBody', val)}
                multiline
                className="text-[15px] sm:text-base text-slate-700 leading-[1.7] mb-3 block"
              />

              <EditableText
                as="p"
                value={config.securityNoticeWarning}
                isEditMode={isEditMode}
                onSave={(val) => onUpdateField('securityNoticeWarning', val)}
                multiline
                className="text-sm font-semibold text-[#C8102E] block"
              />
            </div>

            <div className="lg:col-span-4 rounded-xl bg-slate-50 border border-slate-200 p-6">
              <div className="text-xs font-medium text-slate-500 mb-1">
                যেকোনো প্রয়োজনে হেল্পলাইন
              </div>
              <div className="text-3xl font-bold text-[#0F2942] tabular-nums mb-2">
                ১৬২১৬
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                সিস্টেম জেনারেটেড প্রিন্টেড স্লিপ ও SMS না পেলে সাথে সাথে এজেন্ট বা ১৬২১৬ নম্বরে যোগাযোগ করুন।
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
