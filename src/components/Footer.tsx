interface FooterProps {
  businessName: string;
  branchLocation: string;
}

export function Footer({ businessName, branchLocation }: FooterProps) {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-10 pb-24 print:pb-8">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <a
            href="#"
            className="text-lg font-bold text-[#0F2942] tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {businessName}
          </a>
          <p className="text-xs text-slate-500 mt-1">
            ডাচ-বাংলা ব্যাংক এজেন্ট ব্যাংকিং · {branchLocation}
          </p>
        </div>

        <nav
          aria-label="ফুটার নেভিগেশন"
          className="flex flex-wrap items-center gap-6 text-sm text-slate-600"
        >
          <a href="#services" className="hover:text-slate-900 transition-colors">
            সেবাসমূহ
          </a>
          <a href="#posters" className="hover:text-slate-900 transition-colors">
            পোস্টার ও অফার
          </a>
          <a href="#security" className="hover:text-slate-900 transition-colors">
            নিরাপত্তা তথ্য
          </a>
          <a href="#contact" className="hover:text-slate-900 transition-colors">
            যোগাযোগ
          </a>
        </nav>
      </div>
    </footer>
  );
}
