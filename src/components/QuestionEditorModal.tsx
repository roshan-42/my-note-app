import { useState } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import type { Chapter, ExamQuestion } from '../types';
import { addDoc, updateDoc, deleteDoc, collection, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

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

  const handleSave = async () => {
    if (!questionEn.trim() || !answerEn.trim()) {
      setError('English question and answer required');
      return;
    }
    setSaving(true);
    try {
      const data = {
        chapterId: chapter.id,
        question_en: questionEn,
        question_np: questionNp,
        answer_en: answerEn,
        answer_np: answerNp,
        type,
      };
      if (question) {
        await updateDoc(doc(db, 'questions', question.id), data);
      } else {
        await addDoc(collection(db, 'questions'), { ...data, createdAt: new Date() });
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
    if (!question || !confirm('Delete this question?')) return;
    setSaving(true);
    try {
      await deleteDoc(doc(db, 'questions', question.id));
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
            {question ? 'Edit Question' : 'New Question'} — Ch {chapter.order}
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

        <div className="px-6 pt-4">
          <div className="flex gap-6 pb-4 border-b border-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="past" checked={type === 'past'}
                onChange={(e) => setType(e.target.value as 'past' | 'possible')} disabled={saving}
                className="w-4 h-4 accent-amber-600" />
              <span className="text-sm font-medium text-amber-400">Past Question</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="possible" checked={type === 'possible'}
                onChange={(e) => setType(e.target.value as 'past' | 'possible')} disabled={saving}
                className="w-4 h-4 accent-slate-500" />
              <span className="text-sm font-medium text-slate-300">Possible Question</span>
            </label>
          </div>

          <div className="flex gap-2 pt-3 border-b border-slate-700">
            <button onClick={() => setActiveLang('en')}
              className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                activeLang === 'en' ? 'border-purple-600 text-purple-400' : 'border-transparent text-gray-400 hover:text-white'
              }`}>English</button>
            <button onClick={() => setActiveLang('np')}
              className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                activeLang === 'np' ? 'border-purple-600 text-purple-400' : 'border-transparent text-gray-400 hover:text-white'
              }`}>नेपाली</button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(100vh-380px)] p-6 space-y-6">
          {activeLang === 'en' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Question (English) *</label>
                <textarea value={questionEn} onChange={(e) => setQuestionEn(e.target.value)} disabled={saving}
                  placeholder="What is..." rows={3}
                  className="w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Answer (English) *</label>
                <RichTextEditor value={answerEn} onChange={setAnswerEn} disabled={saving} minHeight={300} />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">प्रश्न (Nepali)</label>
                <textarea value={questionNp} onChange={(e) => setQuestionNp(e.target.value)} disabled={saving}
                  placeholder="के हो..." rows={3}
                  className="w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white text-lg resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">उत्तर (Nepali)</label>
                <RichTextEditor value={answerNp} onChange={setAnswerNp} disabled={saving} minHeight={300} />
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-700 bg-slate-900">
          <div>
            {question && (
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
              className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50">
              <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Question'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
