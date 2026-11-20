import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function ResilientImage({
  src,
  alt,
  className = '',
  fallbackTitle,
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/60 border border-slate-200/80 text-slate-500 p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center mb-3 shadow-xs">
          <ImageIcon className="w-5 h-5 text-slate-400" strokeWidth={1.75} />
        </div>
        <p className="text-sm font-medium text-slate-700 max-w-xs">
          {fallbackTitle || alt}
        </p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
      loading="lazy"
    />
  );
}
