import { useState } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import RichTextEditor from './RichTextEditor';
import type { Chapter, ExamQuestion } from '../types';
import { addDoc, updateDoc, deleteDoc, collection, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useConfirm } from '../context/ConfirmContext';

interface Props {
  chapter: Chapter;
  question?: ExamQuestion;
  onClose: () => void;
  onSave: () => void;
}

export default function QuestionEditorModal({ chapter, question, onClose, onSave }: Props) {
  const [questionEn, setQuestionEn] = useState(question?.question_en || '');
  const [questionNp, setQuestionNp] = useState(question?.question_np || '');
  const [answerEn, setAnswerEn] = useState(question?.answer_en || '');
  const [answerNp, setAnswerNp] = useState(question?.answer_np || '');
  const [type, setType] = useState<'past' | 'possible'>(question?.type || 'past');
  const [activeLang, setActiveLang] = useState<'en' | 'np'>('en');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const confirm = useConfirm();

  const handleSave = async () => {
    if (!questionEn.trim() || !answerEn.trim()) {
      setError('English question and answer required');
      return;
    }
    setSaving(true);
    try {
      const data = {
        chapterId: chapter.id,
        question_en: questionEn, question_np: questionNp,
        answer_en: answerEn, answer_np: answerNp, type,
      };
      if (question) await updateDoc(doc(db, 'questions', question.id), data);
      else await addDoc(collection(db, 'questions'), { ...data, createdAt: new Date() });
      toast.success(question ? 'Question updated' : 'Question added', {
        description: type === 'past' ? 'Past question' : 'Possible question',
      });
      onSave(); onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save';
      setError(msg);
      toast.error('Save failed', { description: msg });
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!question) return;
    const ok = await confirm({
      title: 'Delete this question?',
      message: 'This permanently removes the question and its answer.',
      confirmLabel: 'Delete question',
      tone: 'danger',
    });
    if (!ok) return;
    setSaving(true);
    try {
      await deleteDoc(doc(db, 'questions', question.id));
      toast.success('Question deleted');
      onSave(); onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete';
      setError(msg);
      toast.error('Delete failed', { description: msg });
    } finally { setSaving(false); }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          className="bg-[var(--surface-1)] rounded-none sm:rounded-2xl border-0 sm:border border-[var(--border)] w-full max-w-4xl min-h-screen sm:min-h-0 sm:my-4 flex flex-col"
        >
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[var(--border)] bg-[var(--bg-1)]">
            <h2 className="font-display text-lg sm:text-xl font-bold">
              {question ? 'Edit Question' : 'New Question'} <span className="text-[var(--accent)] text-sm font-mono">Ch {chapter.order}</span>
            </h2>
            <button onClick={onClose} disabled={saving}
              className="p-1.5 rounded text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--surface-2)] disabled:opacity-50">
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-lg bg-red-900/20 border border-red-900/50">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="px-4 sm:px-6 pt-3 pb-3 border-b border-[var(--border)] flex flex-wrap gap-4">
            {(['past', 'possible'] as const).map(t => (
              <label key={t} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" value={t} checked={type === t}
                  onChange={e => setType(e.target.value as 'past' | 'possible')} disabled={saving}
                  className="w-4 h-4 accent-[var(--accent)]" />
                <span className="text-sm font-medium text-[var(--text-2)]">{t === 'past' ? 'Past Question' : 'Possible Question'}</span>
              </label>
            ))}
          </div>

          <div className="px-4 sm:px-6 flex gap-1 border-b border-[var(--border)]">
            {(['en', 'np'] as const).map(l => (
              <button key={l} onClick={() => setActiveLang(l)}
                className={`px-3 sm:px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeLang === l ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text-3)] hover:text-[var(--text-1)]'
                }`}>
                {l === 'en' ? 'English' : 'नेपाली'}
              </button>
            ))}
          </div>

          <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-5">
            {activeLang === 'en' ? (
              <>
                <Field label="Question (English) *">
                  <textarea value={questionEn} onChange={e => setQuestionEn(e.target.value)} disabled={saving}
                    placeholder="What is..." rows={3}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-1)] text-[var(--text-1)] resize-none" />
                </Field>
                <Field label="Answer (English) *">
                  <RichTextEditor value={answerEn} onChange={setAnswerEn} disabled={saving} minHeight={280} />
                </Field>
              </>
            ) : (
              <>
                <Field label="प्रश्न (Nepali)">
                  <textarea value={questionNp} onChange={e => setQuestionNp(e.target.value)} disabled={saving}
                    placeholder="के हो..." rows={3}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-1)] text-[var(--text-1)] text-lg resize-none" />
                </Field>
                <Field label="उत्तर (Nepali)">
                  <RichTextEditor value={answerNp} onChange={setAnswerNp} disabled={saving} minHeight={280} />
                </Field>
              </>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-[var(--border)] bg-[var(--bg-1)]">
            <div>
              {question && (
                <button onClick={handleDelete} disabled={saving}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-900/50 text-red-400 hover:bg-red-900/10 disabled:opacity-50">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={onClose} disabled={saving}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--text-2)] hover:bg-[var(--surface-2)] disabled:opacity-50">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium disabled:opacity-50">
                <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--text-2)] mb-2">{label}</label>
      {children}
    </div>
  );
}
