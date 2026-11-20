import { useRef } from 'react';
import { ArrowRight, ImagePlus, PhoneCall, RotateCcw } from 'lucide-react';
import { DEFAULT_SITE_CONFIG, TRUST_STATS } from '../data/dbblDefaultData';
import type { SiteConfig } from '../types/appTypes';
import { optimizeUploadedImage } from '../utils/imageOptimizer';
import { EditableText } from './EditableText';
import { ResilientImage } from './ResilientImage';

interface HeroSectionProps {
  config: SiteConfig;
  isEditMode: boolean;
  onUpdateField: <K extends keyof SiteConfig>(field: K, value: SiteConfig[K]) => void;
  onBookService: () => void;
}

export function HeroSection({
  config,
  isEditMode,
  onUpdateField,
  onBookService,
}: HeroSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCoverUpload = async (file: File | undefined) => {
    if (!file) return;
    try {
      const optimized = await optimizeUploadedImage(file, 1800, 0.88);
      onUpdateField('coverImage', optimized);
    } catch {
      // Ignore invalid image
    }
  };

  return (
    <section className="pt-6 pb-14 sm:pt-8 sm:pb-16 lg:pb-20 border-b border-slate-200/80 bg-[#F8FAFC]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Large Full-Width Cover Photo Container */}
        <div className="relative w-full h-[280px] sm:h-[400px] lg:h-[500px] rounded-2xl overflow-hidden border border-slate-200 bg-white mb-8 sm:mb-10">
          <ResilientImage
            src={config.coverImage}
            alt={`${config.businessName} — কভার ছবি`}
            fallbackTitle={config.businessName}
            className="w-full h-full object-cover"
          />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              void handleCoverUpload(e.target.files?.[0]);
              e.target.value = '';
            }}
          />

          {/* Subtle bottom scrim with Cover Upload & Edit controls */}
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 bg-gradient-to-t from-slate-900/75 via-slate-900/25 to-transparent flex flex-wrap items-end justify-between gap-4">
            <div className="text-white">
              <div className="text-xs sm:text-sm font-medium text-slate-200">
                {config.bankTitle}
              </div>
              <div className="text-lg sm:text-2xl font-bold tracking-tight">
                {config.businessName} · {config.branchLocation}
              </div>
            </div>

            <div className="flex items-center gap-2 print:hidden">
              {isEditMode &&
                config.coverImage !== DEFAULT_SITE_CONFIG.coverImage && (
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateField('coverImage', DEFAULT_SITE_CONFIG.coverImage)
                    }
                    className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 text-xs font-semibold text-white bg-slate-900/80 hover:bg-slate-900 border border-white/25 rounded-lg cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>পূর্বের কভার</span>
                  </button>
                )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 text-xs sm:text-sm font-semibold text-slate-900 bg-white/95 hover:bg-white rounded-lg shadow-sm cursor-pointer whitespace-nowrap"
              >
                <ImagePlus className="w-4 h-4 text-[#1D4ED8]" />
                <span>কভার ছবি পরিবর্তন করুন</span>
              </button>
            </div>
          </div>
        </div>

        {/* Proposition & Direct Action Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 mb-3">
              <EditableText
                as="span"
                value={config.heroKicker}
                isEditMode={isEditMode}
                onSave={(val) => onUpdateField('heroKicker', val)}
                className="font-semibold text-[#C8102E]"
              />
              <span aria-hidden="true">·</span>
              <EditableText
                as="span"
                value={config.branchLocation}
                isEditMode={isEditMode}
                onSave={(val) => onUpdateField('branchLocation', val)}
              />
            </div>

            <EditableText
              as="h1"
              value={config.heroHeadline}
              isEditMode={isEditMode}
              onSave={(val) => onUpdateField('heroHeadline', val)}
              multiline
              className="text-[#0F2942] font-bold tracking-tight leading-[1.16]"
              style={{ fontSize: 'clamp(2rem, 3.6vw, 3rem)' }}
            />
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between">
            <EditableText
              as="p"
              value={config.heroDescription}
              isEditMode={isEditMode}
              onSave={(val) => onUpdateField('heroDescription', val)}
              multiline
              className="text-base text-slate-600 leading-[1.7] mb-6"
            />

            <div className="flex flex-wrap items-center gap-4 print:hidden">
              <button
                type="button"
                onClick={onBookService}
                className="inline-flex items-center justify-center gap-2.5 min-h-[46px] px-6 py-3 text-[15px] font-medium text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>হিসাব খুলুন বা সেবা নিন</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>

              <a
                href={`tel:+88${config.phones[0]}`}
                className="inline-flex items-center gap-2 min-h-[46px] px-4 py-2.5 text-[15px] font-semibold text-[#047857] bg-white border border-slate-200 hover:border-[#047857] rounded-lg tabular-nums whitespace-nowrap"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{config.phones[0]}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Quantitative Proof Strip */}
        <div className="mt-10 pt-8 border-t border-slate-200 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {TRUST_STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col">
              <span
                className="text-2xl sm:text-3xl font-bold text-[#0F2942] tabular-nums tracking-tight mb-1"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {stat.value}
              </span>
              <span className="text-[15px] font-semibold text-slate-800">
                {stat.label}
              </span>
              <span className="text-[13px] text-slate-500 mt-1">
                {stat.context}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
