import { Globe } from 'lucide-react';
import type { Language } from '../types';

interface Props {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function DualLanguageToggle({ currentLanguage, onLanguageChange }: Props) {
  return (
    <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
      <Globe className="w-4 h-4 text-amber-500 ml-2" />
      <button
        onClick={() => onLanguageChange('en')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
          currentLanguage === 'en'
            ? 'bg-amber-600 text-white shadow-lg'
            : 'text-gray-300 hover:text-white hover:bg-slate-700'
        }`}
      >
        English
      </button>
      <button
        onClick={() => onLanguageChange('np')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
          currentLanguage === 'np'
            ? 'bg-amber-600 text-white shadow-lg'
            : 'text-gray-300 hover:text-white hover:bg-slate-700'
        }`}
      >
        नेपाली
      </button>
    </div>
  );
}
