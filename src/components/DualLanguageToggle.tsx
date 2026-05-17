import { Globe } from 'lucide-react';
import type { Language } from '../types';

interface Props {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function DualLanguageToggle({ currentLanguage, onLanguageChange }: Props) {
  return (
    <div className="flex items-center gap-1 bg-[var(--surface-1)] border border-[var(--border)] rounded-lg p-1">
      <Globe className="w-3.5 h-3.5 text-[var(--accent)] ml-1.5 hidden sm:block" />
      <button
        onClick={() => onLanguageChange('en')}
        className={`px-2.5 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-all ${
          currentLanguage === 'en'
            ? 'bg-[var(--accent)] text-white'
            : 'text-[var(--text-2)] hover:bg-[var(--surface-2)]'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => onLanguageChange('np')}
        className={`px-2.5 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-all ${
          currentLanguage === 'np'
            ? 'bg-[var(--accent)] text-white'
            : 'text-[var(--text-2)] hover:bg-[var(--surface-2)]'
        }`}
      >
        नेपाली
      </button>
    </div>
  );
}
