import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Plus, Save, Trash2, X, ArrowRight, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useCollection } from '../../hooks/useFirestore';
import { uniqueSlug } from '../../utils/slug';
import type { Faculty, Subject } from '../../types';

const EMPTY = { name_en: '', name_np: '', icon: '' };

export default function AdminYear() {
  const { facSlug, year } = useParams();
  const yearNum = parseInt(year || '0');
  const { data: faculties } = useCollection<Faculty>('faculties');
  const { data: subjects } = useCollection<Subject>('subjects');
  const faculty = faculties.find(f => f.slug === facSlug);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  if (!faculty) return <p className="text-[var(--text-3)]">Faculty not found.</p>;

  const ySubjects = subjects.filter(s => s.facultyId === faculty.id && s.year === yearNum);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (s: Subject) => { setEditing(s); setForm({ name_en: s.name_en, name_np: s.name_np, icon: s.icon || '' }); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name_en.trim()) return;
    setLoading(true);
    try {
      if (editing) {
        await updateDoc(doc(db, 'subjects', editing.id), {
          name_en: form.name_en, name_np: form.name_np, icon: form.icon || null,
        });
      } else {
        const slug = uniqueSlug(form.name_en, ySubjects.map(s => s.slug));
        await addDoc(collection(db, 'subjects'), {
          facultyId: faculty.id, year: yearNum,
          name_en: form.name_en, name_np: form.name_np, slug,
          icon: form.icon || null, createdAt: new Date(),
        });
      }
      setShowForm(false); setEditing(null); setForm(EMPTY);
    } catch (err) {
      alert('Save failed: ' + (err as Error).message);
    } finally { setLoading(false); }
  };

  const handleDelete = async (s: Subject) => {
    if (!confirm(`Delete subject "${s.name_en}"?`)) return;
    try { await deleteDoc(doc(db, 'subjects', s.id)); }
    catch (err) { alert('Delete failed: ' + (err as Error).message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Year {yearNum} — Subjects</h1>
          <p className="text-sm text-[var(--text-3)] mt-1">{faculty.name_en}</p>
        </div>
        <button onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium self-start">
          <Plus className="w-4 h-4" /> New Subject
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card-surface rounded-2xl p-5 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">{editing ? 'Edit subject' : 'Add subject'}</h3>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }}
              className="p-1 text-[var(--text-3)] hover:text-[var(--text-1)]"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Name (EN) *" value={form.name_en} onChange={v => setForm({ ...form, name_en: v })} required />
            <Input label="Name (नेपाली)" value={form.name_np} onChange={v => setForm({ ...form, name_np: v })} />
            <div>
              <label className="block text-xs font-medium text-[var(--text-3)] mb-1">Icon (emoji)</label>
              <input type="text" maxLength={4} value={form.icon}
                onChange={e => setForm({ ...form, icon: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] text-center text-xl" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium disabled:opacity-50">
              <Save className="w-4 h-4" /> {loading ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }}
              className="px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--text-2)] hover:bg-[var(--surface-1)] text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {ySubjects.length === 0 ? (
        <div className="card-surface rounded-2xl p-10 text-center text-[var(--text-3)]">
          No subjects in Year {yearNum}.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ySubjects.map((s, i) => (
            <motion.div key={s.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="card-surface rounded-2xl p-4 flex items-center gap-3"
            >
              <div className="text-2xl">{s.icon || '📘'}</div>
              <Link to={`/admin/${facSlug}/year/${yearNum}/${s.slug}`} className="flex-1 min-w-0 group">
                <p className="font-semibold text-[var(--text-1)] truncate group-hover:text-[var(--accent)]">{s.name_en}</p>
                <p className="text-xs text-[var(--text-3)] truncate">/{s.slug}</p>
              </Link>
              <Link to={`/admin/${facSlug}/year/${yearNum}/${s.slug}`}
                className="p-1.5 rounded text-[var(--text-3)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)]">
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button onClick={() => openEdit(s)}
                className="p-1.5 rounded text-[var(--text-3)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)]">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(s)}
                className="p-1.5 rounded text-[var(--text-3)] hover:text-red-400 hover:bg-red-500/10">
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function Input({ label, value, onChange, required }: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[var(--text-3)] mb-1">{label}</label>
      <input
        type="text" value={value} onChange={e => onChange(e.target.value)} required={required}
        className="w-full px-3 py-2 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] text-sm"
      />
    </div>
  );
}
