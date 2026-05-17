import { useState } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RichTextEditor from './RichTextEditor';
import type { Chapter, Note } from '../types';
import { addDoc, updateDoc, deleteDoc, collection, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface Props {
  chapter: Chapter;
  note?: Note;
  onClose: () => void;
  onSave: () => void;
}

export default function NoteEditorModal({ chapter, note, onClose, onSave }: Props) {
  const [titleEn, setTitleEn] = useState(note?.title_en || '');
  const [titleNp, setTitleNp] = useState(note?.title_np || '');
  const [contentEn, setContentEn] = useState(note?.content_en || '');
  const [contentNp, setContentNp] = useState(note?.content_np || '');
  const [activeLang, setActiveLang] = useState<'en' | 'np'>('en');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!titleEn.trim() || !contentEn.trim()) {
      setError('English title and content required');
      return;
    }
    setSaving(true);
    try {
      const data = {
        chapterId: chapter.id,
        title_en: titleEn, title_np: titleNp,
        content_en: contentEn, content_np: contentNp,
        order: note?.order || 1,
        updatedAt: new Date(),
      };
      if (note) await updateDoc(doc(db, 'notes', note.id), data);
      else await addDoc(collection(db, 'notes'), { ...data, createdAt: new Date() });
      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!note || !confirm('Delete this note?')) return;
    setSaving(true);
    try {
      await deleteDoc(doc(db, 'notes', note.id));
      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
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
              {note ? 'Edit Note' : 'New Note'} <span className="text-[var(--accent)] text-sm font-mono">Ch {chapter.order}</span>
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

          <div className="px-4 sm:px-6 pt-3 flex gap-1 border-b border-[var(--border)]">
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
                <Field label="Title (English) *">
                  <input type="text" value={titleEn} onChange={e => setTitleEn(e.target.value)} disabled={saving}
                    placeholder="e.g., Introduction to Constitutional Law"
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-1)] text-[var(--text-1)]" />
                </Field>
                <Field label="Content (English) *">
                  <RichTextEditor value={contentEn} onChange={setContentEn} disabled={saving} minHeight={350} />
                </Field>
              </>
            ) : (
              <>
                <Field label="शीर्षक (Nepali)">
                  <input type="text" value={titleNp} onChange={e => setTitleNp(e.target.value)} disabled={saving}
                    placeholder="जस्तै, संवैधानिक कानूनको परिचय"
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-1)] text-[var(--text-1)] text-lg" />
                </Field>
                <Field label="सामग्री (Nepali)">
                  <RichTextEditor value={contentNp} onChange={setContentNp} disabled={saving} minHeight={350} />
                </Field>
              </>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-[var(--border)] bg-[var(--bg-1)]">
            <div>
              {note && (
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
                <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Note'}
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
