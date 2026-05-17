import { useState } from 'react';
import { Plus, Save, Trash2, Edit2, X } from 'lucide-react';
import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { uniqueSlug } from '../utils/slug';
import type { Faculty } from '../types';

interface Props { faculties: Faculty[] }

const EMPTY = {
  name_en: '', name_np: '', description_en: '', description_np: '',
  totalYears: 3, icon: '🎓',
};

export default function FacultyEditor({ faculties }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Faculty | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (f: Faculty) => {
    setEditing(f);
    setForm({
      name_en: f.name_en, name_np: f.name_np,
      description_en: f.description_en, description_np: f.description_np,
      totalYears: f.totalYears, icon: f.icon,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name_en.trim()) return;
    setLoading(true);
    try {
      if (editing) {
        await updateDoc(doc(db, 'faculties', editing.id), {
          name_en: form.name_en,
          name_np: form.name_np,
          description_en: form.description_en,
          description_np: form.description_np,
          totalYears: Number(form.totalYears) || 3,
          icon: form.icon || '🎓',
        });
      } else {
        const slug = uniqueSlug(form.name_en, faculties.map(f => f.slug));
        const order = faculties.length;
        await addDoc(collection(db, 'faculties'), {
          name_en: form.name_en,
          name_np: form.name_np,
          slug,
          description_en: form.description_en,
          description_np: form.description_np,
          totalYears: Number(form.totalYears) || 3,
          icon: form.icon || '🎓',
          accent: 'amber',
          order,
          createdAt: new Date(),
        });
      }
      setShowForm(false); setEditing(null); setForm(EMPTY);
    } catch (err) {
      console.error(err);
      alert('Save failed: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (f: Faculty) => {
    if (!confirm(`Delete faculty "${f.name_en}"? This does NOT delete its subjects/chapters automatically.`)) return;
    try {
      await deleteDoc(doc(db, 'faculties', f.id));
    } catch (err) {
      alert('Delete failed: ' + (err as Error).message);
    }
  };

  return (
    <div className="card-surface rounded-2xl p-5 sm:p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display text-xl font-bold">Faculties</h2>
        <button onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium">
          <Plus className="w-4 h-4" /> New
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border border-[var(--border)] rounded-xl p-4 mb-5 bg-[var(--bg-1)] space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">{editing ? 'Edit faculty' : 'Create faculty'}</h3>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }}
              className="p-1 text-[var(--text-3)] hover:text-[var(--text-1)]"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Name (EN) *" value={form.name_en} onChange={v => setForm({ ...form, name_en: v })} required />
            <Input label="Name (नेपाली)" value={form.name_np} onChange={v => setForm({ ...form, name_np: v })} />
            <Input label="Description (EN)" value={form.description_en} onChange={v => setForm({ ...form, description_en: v })} />
            <Input label="Description (नेपाली)" value={form.description_np} onChange={v => setForm({ ...form, description_np: v })} />
            <div>
              <label className="block text-xs font-medium text-[var(--text-3)] mb-1">Total years</label>
              <input type="number" min={1} max={8} value={form.totalYears}
                onChange={e => setForm({ ...form, totalYears: parseInt(e.target.value) || 3 })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-3)] mb-1">Icon (emoji)</label>
              <input type="text" maxLength={4} value={form.icon}
                onChange={e => setForm({ ...form, icon: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] text-center text-xl" />
            </div>
          </div>
          {!editing && (
            <p className="text-xs text-[var(--text-3)]">Slug will be auto-generated from name.</p>
          )}
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

      {faculties.length === 0 ? (
        <p className="text-sm text-[var(--text-3)] text-center py-6">No faculties yet. Click "New" to add one.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {faculties.map(f => (
            <div key={f.id} className="border border-[var(--border)] rounded-xl p-4 flex items-center gap-3 bg-[var(--bg-1)]">
              <div className="text-2xl">{f.icon || '🎓'}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[var(--text-1)] truncate">{f.name_en}</p>
                <p className="text-xs text-[var(--text-3)] truncate">/{f.slug} · {f.totalYears} year{f.totalYears !== 1 ? 's' : ''}</p>
              </div>
              <button onClick={() => openEdit(f)}
                className="p-1.5 rounded text-[var(--text-3)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)]">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(f)}
                className="p-1.5 rounded text-[var(--text-3)] hover:text-red-400 hover:bg-red-500/10">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
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
