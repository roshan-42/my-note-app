import { useState, useMemo } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { useCollection } from '../hooks/useFirestore';
import type { Subject, Chapter } from '../types';
import { addDoc, deleteDoc, collection, doc, where } from 'firebase/firestore';
import { db } from '../config/firebase';

interface Props {
  subject: Subject;
  onRefresh: () => void;
}

export default function ChapterEditor({ subject, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [titleEn, setTitleEn] = useState('');
  const [titleNp, setTitleNp] = useState('');
  const [loading, setLoading] = useState(false);

  const constraints = useMemo(() => [where('subjectId', '==', subject.id)], [subject.id]);
  const { data: chapters } = useCollection<Chapter>('chapters', constraints);
  const sorted = [...chapters].sort((a, b) => a.order - b.order);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn.trim()) return;
    setLoading(true);
    try {
      const nextOrder = sorted.length > 0 ? Math.max(...sorted.map(c => c.order)) + 1 : 1;
      await addDoc(collection(db, 'chapters'), {
        subjectId: subject.id,
        title_en: titleEn,
        title_np: titleNp,
        order: nextOrder,
        createdAt: new Date(),
      });
      setTitleEn(''); setTitleNp(''); setShowForm(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this chapter?')) return;
    try {
      await deleteDoc(doc(db, 'chapters', id));
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-white">{subject.name_en}</h3>
          <p className="text-sm text-gray-400 mt-1">{subject.name_np}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
          <Plus className="w-5 h-5" />Add Chapter
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="p-6 border border-slate-700 rounded-lg bg-slate-800 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Title (English) *</label>
            <input type="text" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} placeholder="e.g., Fundamental Rights"
              className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Title (Nepali)</label>
            <input type="text" value={titleNp} onChange={(e) => setTitleNp(e.target.value)} placeholder="जस्तै, मौलिक हकहरू"
              className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white text-lg" />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
              <Save className="w-4 h-4" />{loading ? 'Adding...' : 'Add Chapter'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-slate-600 rounded-lg text-gray-300 hover:bg-slate-700 transition-colors">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {sorted.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No chapters yet</p>
        ) : (
          sorted.map(ch => (
            <div key={ch.id} className="p-4 border border-slate-700 rounded-lg bg-slate-800 flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-white">{ch.title_en}</h4>
                <p className="text-sm text-gray-400 mt-1">{ch.title_np}</p>
              </div>
              <button onClick={() => handleDelete(ch.id)}
                className="p-2 text-red-400 hover:bg-red-900/30 rounded transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
