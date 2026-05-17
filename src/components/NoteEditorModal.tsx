import { useState } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
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
        title_en: titleEn,
        title_np: titleNp,
        content_en: contentEn,
        content_np: contentNp,
        order: note?.order || 1,
        updatedAt: new Date(),
      };
      if (note) {
        await updateDoc(doc(db, 'notes', note.id), data);
      } else {
        await addDoc(collection(db, 'notes'), { ...data, createdAt: new Date() });
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
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
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-4xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-900">
          <h2 className="text-xl font-semibold text-white">
            {note ? 'Edit Note' : 'New Note'} — Ch {chapter.order}
          </h2>
          <button onClick={onClose} disabled={saving} className="text-gray-400 hover:text-white disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-red-900/20 border border-red-900/50">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="px-6 pt-4 flex gap-2 border-b border-slate-700">
          <button
            onClick={() => setActiveLang('en')}
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
              activeLang === 'en' ? 'border-amber-600 text-amber-400' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >English</button>
          <button
            onClick={() => setActiveLang('np')}
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
              activeLang === 'np' ? 'border-amber-600 text-amber-400' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >नेपाली</button>
        </div>

        <div className="overflow-y-auto max-h-[calc(100vh-350px)] p-6 space-y-6">
          {activeLang === 'en' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title (English) *</label>
                <input
                  type="text" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} disabled={saving}
                  placeholder="e.g., Introduction to Constitutional Law"
                  className="w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Content (English) *</label>
                <RichTextEditor value={contentEn} onChange={setContentEn} disabled={saving} minHeight={400} />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">शीर्षक (Nepali)</label>
                <input
                  type="text" value={titleNp} onChange={(e) => setTitleNp(e.target.value)} disabled={saving}
                  placeholder="जस्तै, संवैधानिक कानूनको परिचय"
                  className="w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">सामग्री (Nepali)</label>
                <RichTextEditor value={contentNp} onChange={setContentNp} disabled={saving} minHeight={400} />
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-700 bg-slate-900">
          <div>
            {note && (
              <button onClick={handleDelete} disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-900/50 text-red-400 hover:bg-red-900/10 disabled:opacity-50">
                <Trash2 className="w-4 h-4" />Delete
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} disabled={saving}
              className="px-6 py-2 rounded-lg border border-slate-600 text-gray-300 hover:bg-slate-700 disabled:opacity-50">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-50">
              <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
