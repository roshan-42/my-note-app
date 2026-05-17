import { useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import type { Subject } from '../types';
import { addDoc, deleteDoc, collection, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface Props {
  year: number;
  subjects: Subject[];
  onSubjectSelect: (s: Subject) => void;
  onRefresh: () => void;
}

export default function SubjectEditor({ year, subjects, onSubjectSelect, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [nameEn, setNameEn] = useState('');
  const [nameNp, setNameNp] = useState('');
  const [icon, setIcon] = useState('');
  const [loading, setLoading] = useState(false);

  const yearSubjects = subjects.filter(s => s.yearId === `year-${year}`);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim()) return;
    setLoading(true);
    try {
      const slug = nameEn.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      await addDoc(collection(db, 'subjects'), {
        yearId: `year-${year}`,
        name_en: nameEn,
        name_np: nameNp,
        slug,
        icon: icon || null,
        createdAt: new Date(),
      });
      setNameEn(''); setNameNp(''); setIcon(''); setShowForm(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this subject?')) return;
    try {
      await deleteDoc(doc(db, 'subjects', id));
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-white">Year {year} Subjects</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors">
          <Plus className="w-5 h-5" />Add Subject
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="p-6 border border-slate-700 rounded-lg bg-slate-800 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Name (English) *</label>
            <input type="text" value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="e.g., Constitutional Law"
              className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Name (Nepali)</label>
            <input type="text" value={nameNp} onChange={(e) => setNameNp(e.target.value)} placeholder="जस्तै, संवैधानिक कानून"
              className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white text-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Icon (emoji, optional)</label>
            <input type="text" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="📚" maxLength={2}
              className="w-20 px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white text-center text-xl" />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={loading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
              <Save className="w-4 h-4" />{loading ? 'Adding...' : 'Add Subject'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-slate-600 rounded-lg text-gray-300 hover:bg-slate-700 transition-colors">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {yearSubjects.length === 0 ? (
          <p className="text-gray-400 col-span-2 text-center py-8">No subjects for Year {year} yet</p>
        ) : (
          yearSubjects.map(s => (
            <div key={s.id} className="relative group p-6 border border-slate-700 rounded-lg bg-slate-800 hover:border-purple-600/50 transition-colors">
              <button onClick={() => onSubjectSelect(s)} className="w-full text-left">
                {s.icon && <div className="text-2xl mb-2">{s.icon}</div>}
                <h3 className="font-semibold text-white">{s.name_en}</h3>
                <p className="text-sm text-gray-400 mt-1">{s.name_np}</p>
                <p className="text-xs text-gray-500 mt-2">/{s.slug}</p>
              </button>
              <button onClick={() => handleDelete(s.id)}
                className="absolute top-2 right-2 p-1.5 rounded bg-red-600 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
