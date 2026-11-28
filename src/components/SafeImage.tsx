import { ImageOff } from 'lucide-react';
import { ReactNode, useState } from 'react';

interface SafeImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackIcon?: ReactNode;
}

export function SafeImage({ src, alt, className = 'w-full h-full object-cover', fallbackIcon }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#EFF4FF] to-[#E5EEFF] dark:from-[#161B22] dark:to-[#1E2430] text-[#4648D4] dark:text-[#818CF8] p-4 text-center">
        {fallbackIcon || <ImageOff className="h-7 w-7 opacity-75" />}
        <span className="text-xs font-medium text-[#464554] dark:text-slate-300 line-clamp-2 max-w-[20ch]">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
