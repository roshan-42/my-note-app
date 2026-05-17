import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

type Tone = 'danger' | 'warning' | 'info';

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: Tone;
}

interface ConfirmContextType {
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

interface ActiveState extends ConfirmOptions { open: boolean }

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ActiveState>({ open: false, title: '' });
  const resolverRef = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>(resolve => {
      resolverRef.current = resolve;
      setState({ open: true, ...opts });
    });
  }, []);

  const handle = (value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setState(s => ({ ...s, open: false }));
  };

  const tone: Tone = state.tone || 'danger';
  const toneAccent: Record<Tone, string> = {
    danger: 'text-red-400 bg-red-500/10',
    warning: 'text-amber-400 bg-amber-500/10',
    info: 'text-blue-400 bg-blue-500/10',
  };
  const toneBtn: Record<Tone, string> = {
    danger: 'bg-red-600 hover:bg-red-500',
    warning: 'bg-amber-600 hover:bg-amber-500',
    info: 'bg-[var(--accent)] hover:bg-[var(--accent-hover)]',
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {state.open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => handle(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="relative w-full max-w-md card-surface rounded-2xl p-6 shadow-2xl shadow-black/50"
            >
              <button onClick={() => handle(false)}
                className="absolute top-3 right-3 p-1.5 rounded text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--surface-2)]">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${toneAccent[tone]}`}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <h3 className="font-display text-lg font-bold text-[var(--text-1)]">{state.title}</h3>
                  {state.message && (
                    <p className="text-sm text-[var(--text-2)] mt-2 leading-relaxed">{state.message}</p>
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button onClick={() => handle(false)}
                  className="px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--text-2)] hover:bg-[var(--surface-2)] text-sm font-medium">
                  {state.cancelLabel || 'Cancel'}
                </button>
                <button onClick={() => handle(true)}
                  className={`px-4 py-2 rounded-lg text-white text-sm font-semibold ${toneBtn[tone]}`}>
                  {state.confirmLabel || 'Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx.confirm;
}
