import { useEffect, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
} from 'lucide-react';
import type { CustomerLead, SiteConfig } from '../types/appTypes';
import { EditableText } from './EditableText';

interface ContactSectionProps {
  config: SiteConfig;
  isEditMode: boolean;
  onUpdateField: <K extends keyof SiteConfig>(field: K, value: SiteConfig[K]) => void;
  preselectedService: string;
  onSubmitLead: (lead: Omit<CustomerLead, 'id' | 'createdAt'>) => void;
}

export function ContactSection({
  config,
  isEditMode,
  onUpdateField,
  preselectedService,
  onSubmitLead,
}: ContactSectionProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState(
    config.services[0]?.title || 'সঞ্চয়ী ও চলতি হিসাব খোলা'
  );
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    message?: string;
  }>({});
  const [submittedLead, setSubmittedLead] = useState<{
    name: string;
    phone: string;
    service: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (preselectedService) {
      setService(preselectedService);
    }
  }, [preselectedService]);

  const validate = () => {
    const next: { name?: string; phone?: string; message?: string } = {};
    if (!name.trim() || name.trim().length < 2) {
      next.name = 'অনুগ্রহ করে আপনার নাম লিখুন।';
    }
    const cleaned = phone.replace(/[\s-]/g, '');
    if (!cleaned || !/^(\+?880|0)?1[3-9]\d{8}$/.test(cleaned)) {
      next.phone = 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।';
    }
    if (!message.trim() || message.trim().length < 6) {
      next.message = 'আপনার প্রয়োজন বা প্রশ্নটি সংক্ষেপে লিখুন।';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      service,
      message: message.trim(),
    };
    onSubmitLead(payload);
    setSubmittedLead(payload);
  };

  const buildWhatsappHref = (targetPhone: string) => {
    const cleanTarget = targetPhone.replace(/[^0-9]/g, '').replace(/^88/, '');
    const text = submittedLead
      ? `আসসালামু আলাইকুম, আমি ${submittedLead.name} (${submittedLead.phone})।\nসেবা: ${submittedLead.service}\nবিবরণ: ${submittedLead.message}`
      : `আসসালামু আলাইকুম, ${config.businessName} থেকে ব্যাংকিং সেবা সম্পর্কে জানতে চাই।`;
    return `https://wa.me/88${cleanTarget}?text=${encodeURIComponent(text)}`;
  };

  return (
    <section id="contact" className="py-16 sm:py-20 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Outlet Contact Details */}
          <div className="lg:col-span-5">
            <p className="text-sm font-medium text-[#1D4ED8] mb-2">
              সরাসরি যোগাযোগ ও সেবা আবেদন
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F2942] tracking-tight leading-tight mb-4">
              {config.businessName}-এ আজই যোগাযোগ করুন
            </h2>
            <p className="text-[15px] sm:text-base text-slate-600 leading-[1.7] mb-8">
              নতুন একাউন্ট খোলা, ডিপিএস, এফডিআর, লোন বা রেমিট্যান্স সংক্রান্ত যেকোনো তথ্যের জন্য ফরমটি পূরণ করুন অথবা সরাসরি আমাদের হোয়াটসঅ্যাপ ও মোবাইলে যোগাযোগ করুন।
            </p>

            <div className="space-y-5 pt-6 border-t border-slate-200">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-[#0F2942]" />
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500">
                    আউটলেট মোবাইল নম্বর
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-0.5">
                    {config.phones.map((ph) => (
                      <a
                        key={ph}
                        href={`tel:+88${ph}`}
                        className="text-[15px] font-bold text-slate-900 hover:text-[#1D4ED8] tabular-nums"
                      >
                        {ph}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4 text-[#047857]" />
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500">
                    হোয়াটসঅ্যাপ নম্বর (তথ্য ও ফরম পাঠাতে)
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1">
                    {config.whatsappNumbers.map((wa) => (
                      <a
                        key={wa}
                        href={buildWhatsappHref(wa)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-[#047857] hover:underline tabular-nums"
                      >
                        WhatsApp: {wa}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-[#1D4ED8]" />
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500">
                    অফিশিয়াল ইমেইল
                  </div>
                  {isEditMode ? (
                    <EditableText
                      as="p"
                      value={config.email}
                      isEditMode={isEditMode}
                      onSave={(val) => onUpdateField('email', val)}
                      className="text-[15px] font-semibold text-slate-900 block mt-0.5"
                    />
                  ) : (
                    <a
                      href={`mailto:${config.email}`}
                      className="text-[15px] font-semibold text-slate-900 hover:text-[#1D4ED8] block mt-0.5"
                    >
                      {config.email}
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-[#C8102E]" />
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500">
                    অফিসের ঠিকানা ও সময়
                  </div>
                  <EditableText
                    as="p"
                    value={config.branchLocation}
                    isEditMode={isEditMode}
                    onSave={(val) => onUpdateField('branchLocation', val)}
                    className="text-[15px] font-semibold text-slate-900 block"
                  />
                  <EditableText
                    as="p"
                    value={config.hours}
                    isEditMode={isEditMode}
                    onSave={(val) => onUpdateField('hours', val)}
                    className="text-xs text-slate-500 mt-0.5 block"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Lead Form with WhatsApp Delivery */}
          <div className="lg:col-span-7">
            <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-6 sm:p-8 lg:p-10">
              {submittedLead ? (
                <div className="py-6 text-center max-w-md mx-auto">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-6 h-6 text-[#047857]" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    ধন্যবাদ, {submittedLead.name}!
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    আপনার আবেদনটি সংরক্ষণ করা হয়েছে। এখন সরাসরি হোয়াটসঅ্যাপে পাঠাতে নিচের যেকোনো নম্বরে ক্লিক করুন:
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                    {config.whatsappNumbers.map((wa) => (
                      <a
                        key={wa}
                        href={buildWhatsappHref(wa)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 min-h-[42px] px-4 py-2 text-sm font-semibold text-white bg-[#047857] hover:bg-emerald-800 rounded-lg tabular-nums"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>হোয়াটসঅ্যাপ ({wa})</span>
                      </a>
                    ))}
                    <a
                      href={`mailto:${config.email}?subject=${encodeURIComponent(
                        `${config.businessName} — নতুন সেবা আবেদন (${submittedLead.name})`
                      )}&body=${encodeURIComponent(
                        `নাম: ${submittedLead.name}\nমোবাইল: ${submittedLead.phone}\nসেবা: ${submittedLead.service}\nবিবরণ: ${submittedLead.message}`
                      )}`}
                      className="inline-flex items-center gap-2 min-h-[42px] px-4 py-2 text-sm font-semibold text-slate-900 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg"
                    >
                      <Mail className="w-4 h-4 text-[#1D4ED8]" />
                      <span>ইমেইলে পাঠান</span>
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedLead(null);
                      setName('');
                      setPhone('');
                      setMessage('');
                    }}
                    className="text-sm font-medium text-slate-600 hover:text-slate-900 underline cursor-pointer"
                  >
                    নতুন আরেকটি আবেদন করুন
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="cust-name"
                        className="block text-sm font-medium text-slate-800 mb-1.5"
                      >
                        আপনার নাম <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="cust-name"
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (errors.name)
                            setErrors({ ...errors, name: undefined });
                        }}
                        placeholder="আপনার পূর্ণ নাম"
                        className={`w-full min-h-[44px] px-3.5 py-2.5 text-[15px] rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] ${
                          errors.name ? 'border-red-500' : 'border-slate-300'
                        }`}
                      />
                      {errors.name && (
                        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.name}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="cust-phone"
                        className="block text-sm font-medium text-slate-800 mb-1.5"
                      >
                        মোবাইল নম্বর <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="cust-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (errors.phone)
                            setErrors({ ...errors, phone: undefined });
                        }}
                        placeholder="017XXXXXXXX"
                        className={`w-full min-h-[44px] px-3.5 py-2.5 text-[15px] rounded-lg border bg-white text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] ${
                          errors.phone ? 'border-red-500' : 'border-slate-300'
                        }`}
                      />
                      {errors.phone && (
                        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="cust-service"
                      className="block text-sm font-medium text-slate-800 mb-1.5"
                    >
                      প্রয়োজনীয় সেবার ধরন
                    </label>
                    <select
                      id="cust-service"
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 py-2.5 text-[15px] rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]"
                    >
                      {!config.services.some((s) => s.title === service) &&
                        service && <option value={service}>{service}</option>}
                      {config.services.map((s) => (
                        <option key={s.id} value={s.title}>
                          {s.number}. {s.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="cust-msg"
                      className="block text-sm font-medium text-slate-800 mb-1.5"
                    >
                      বিস্তারিত বার্তা <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      id="cust-msg"
                      rows={3}
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        if (errors.message)
                          setErrors({ ...errors, message: undefined });
                      }}
                      placeholder="আপনি কোন সেবাটি নিতে চান বা কী জানতে চান লিখুন..."
                      className={`w-full px-3.5 py-2.5 text-[15px] rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] ${
                        errors.message ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {errors.message && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.message}</span>
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center min-h-[46px] px-7 py-3 text-[15px] font-medium text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg transition-colors duration-150 whitespace-nowrap cursor-pointer"
                  >
                    আবেদন জমা দিন ও হোয়াটসঅ্যাপে পাঠান
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
