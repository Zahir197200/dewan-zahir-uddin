import { useState } from 'react';
import { ArrowUpRight, Check } from 'lucide-react';
import type { BankingServiceItem, ServiceCategory } from '../types/appTypes';
import { EditableText } from './EditableText';

interface ServicesSectionProps {
  services: BankingServiceItem[];
  isEditMode: boolean;
  onUpdateService: (id: string, patch: Partial<BankingServiceItem>) => void;
  onSelectService: (serviceTitle: string) => void;
}

const FILTERS: { id: ServiceCategory; label: string }[] = [
  { id: 'all', label: 'সকল সেবা' },
  { id: 'account', label: 'হিসাব ও সঞ্চয়' },
  { id: 'loan', label: 'লোন সুবিধা' },
  { id: 'remittance', label: 'রেমিট্যান্স ও বিল' },
];

export function ServicesSection({
  services,
  isEditMode,
  onUpdateService,
  onSelectService,
}: ServicesSectionProps) {
  const [activeFilter, setActiveFilter] = useState<ServiceCategory>('all');

  const filtered =
    activeFilter === 'all'
      ? services
      : services.filter((s) => s.category === activeFilter);

  return (
    <section id="services" className="py-16 sm:py-20 bg-[#F8FAFC]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-12">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-[#1D4ED8] mb-2">
              ডাচ-বাংলা ব্যাংক এজেন্ট ব্যাংকিং সেবাসমূহ
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F2942] tracking-tight leading-tight">
              আপনার দৈনন্দিন ও দীর্ঘমেয়াদী সকল ব্যাংকিং প্রয়োজন এক ছাদের নিচে
            </h2>
          </div>

          <div
            role="tablist"
            aria-label="ব্যাংকিং সেবার ধরন"
            className="inline-flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg self-start md:self-auto overflow-x-auto max-w-full print:hidden"
          >
            {FILTERS.map((f) => {
              const isActive = activeFilter === f.id;
              return (
                <button
                  key={f.id}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  onClick={() => setActiveFilter(f.id)}
                  className={`min-h-[38px] px-3.5 py-1.5 text-sm font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Asymmetric Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {filtered.map((service, index) => {
            const isFeatured =
              activeFilter === 'all' && service.featured && index === 0;

            return (
              <article
                key={service.id}
                className={`group rounded-xl border border-slate-200 bg-white p-6 sm:p-8 flex flex-col justify-between transition-colors duration-150 hover:border-slate-300 ${
                  isFeatured ? 'lg:col-span-2' : 'lg:col-span-1'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 text-[13px] text-slate-500 mb-3">
                    <span className="font-semibold text-[#1D4ED8] tabular-nums">
                      {service.number}.
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{service.categoryLabel}</span>
                  </div>

                  <EditableText
                    as="h3"
                    value={service.title}
                    isEditMode={isEditMode}
                    onSave={(val) => onUpdateService(service.id, { title: val })}
                    className="text-xl sm:text-2xl font-bold text-[#0F2942] leading-snug mb-3 block"
                  />

                  <EditableText
                    as="p"
                    value={service.description}
                    isEditMode={isEditMode}
                    onSave={(val) =>
                      onUpdateService(service.id, { description: val })
                    }
                    multiline
                    className="text-[15px] leading-[1.65] text-slate-600 mb-6 block"
                  />

                  <ul className="space-y-2.5 mb-6">
                    {service.highlights.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-sm text-slate-700"
                      >
                        <Check
                          className="w-4 h-4 text-[#047857] shrink-0 mt-0.5"
                          strokeWidth={2}
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-100 print:hidden">
                  <button
                    type="button"
                    onClick={() => onSelectService(service.title)}
                    className="inline-flex items-center gap-1.5 min-h-[40px] text-sm font-semibold text-[#1D4ED8] hover:text-[#1E40AF] transition-colors duration-150 cursor-pointer whitespace-nowrap"
                  >
                    <span>এই সেবার জন্য আবেদন করুন</span>
                    <ArrowUpRight className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
