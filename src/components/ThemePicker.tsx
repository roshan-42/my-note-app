import { useState, useRef, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';
import { THEMES, useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThemePicker() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Change theme"
        className="p-2 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--accent)] transition-colors"
      >
        <Palette className="w-4 h-4" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-44 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] shadow-2xl shadow-black/40 backdrop-blur-md z-50 overflow-hidden"
          >
            <div className="p-2 text-xs uppercase tracking-wider text-[var(--text-3)] border-b border-[var(--border)]">Theme</div>
            {THEMES.map(t => (
              <button
                key={t.id}
                onClick={() => { setTheme(t.id); setOpen(false); }}
                className="w-full px-3 py-2 flex items-center gap-3 text-sm text-[var(--text-1)] hover:bg-[var(--surface-2)] transition-colors"
              >
                <span
                  className="w-4 h-4 rounded-full border border-white/10"
                  style={{ background: t.swatch }}
                />
                <span className="flex-1 text-left">{t.label}</span>
                {theme === t.id && <Check className="w-3.5 h-3.5 text-[var(--accent)]" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
