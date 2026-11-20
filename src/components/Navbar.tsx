import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  businessName: string;
  onBookService: () => void;
}

const NAV_LINKS = [
  { href: '#services', label: 'সেবাসমূহ' },
  { href: '#posters', label: 'পোস্টার ও অফার' },
  { href: '#ledger', label: 'স্থায়ী হিসাব ঘর' },
  { href: '#contact', label: 'যোগাযোগ' },
];

export function Navbar({ businessName, onBookService }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handlePrimaryAction = () => {
    setMobileOpen(false);
    onBookService();
  };

  return (
    <header className="sticky top-0 z-30 bg-[#F8FAFC]/95 backdrop-blur-md border-b border-slate-200/80 print:static print:bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#"
          className="text-lg sm:text-xl font-bold tracking-tight text-[#0F2942] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1D4ED8] rounded-sm"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {businessName}
        </a>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav
          aria-label="প্রধান নেভিগেশন"
          className="hidden md:flex items-center gap-8 text-[15px] font-medium text-slate-600"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-[#0F2942] hover:underline underline-offset-8 decoration-slate-300 transition-colors duration-150 whitespace-nowrap shrink-0 py-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1D4ED8] rounded-sm"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: 1 primary action (desktop) + mobile menu toggle */}
        <div className="flex items-center gap-3 shrink-0 print:hidden">
          <button
            type="button"
            onClick={handlePrimaryAction}
            className="hidden sm:inline-flex items-center justify-center min-h-[40px] px-5 py-2 text-sm font-medium text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
          >
            সেবা বুক করুন
          </button>

          <button
            type="button"
            aria-label={mobileOpen ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-slate-200 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 print:hidden">
          <nav aria-label="মোবাইল নেভিগেশন" className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="min-h-[44px] flex items-center px-3 rounded-lg text-[15px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
            <button
              type="button"
              onClick={handlePrimaryAction}
              className="mt-2 min-h-[44px] w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg transition-colors duration-150 whitespace-nowrap cursor-pointer"
            >
              সেবা বুক করুন
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
