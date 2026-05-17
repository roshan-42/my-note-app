import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Plus, Save, Trash2, X, ArrowRight, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { addDoc, collection, doc, updateDoc, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useCollection } from '../../hooks/useFirestore';
import { uniqueSlug } from '../../utils/slug';
import { termLabel } from '../../utils/term';
import { cascadeDeleteChapter, formatCascadeSummary } from '../../utils/cascade';
import { useConfirm } from '../../context/ConfirmContext';
import type { Faculty, Subject, Chapter } from '../../types';

const EMPTY = { title_en: '', title_np: '' };

export default function AdminSubject() {
  const { facSlug, year, subjSlug } = useParams();
  const yearNum = parseInt(year || '0');
  const { data: faculties } = useCollection<Faculty>('faculties');
  const { data: subjects } = useCollection<Subject>('subjects');
  const faculty = faculties.find(f => f.slug === facSlug);
  const subject = subjects.find(s => s.slug === subjSlug && s.facultyId === faculty?.id && s.year === yearNum);

  const constraints = useMemo(() => subject ? [where('subjectId', '==', subject.id)] : [], [subject?.id]);
  const { data: chapters } = useCollection<Chapter>('chapters', constraints);
  const sorted = [...chapters].sort((a, b) => a.order - b.order);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Chapter | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const confirm = useConfirm();

  if (!subject) return <p className="text-[var(--text-3)]">Subject not found.</p>;

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (c: Chapter) => { setEditing(c); setForm({ title_en: c.title_en, title_np: c.title_np }); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title_en.trim()) return;
    setLoading(true);
    try {
      if (editing) {
        await updateDoc(doc(db, 'chapters', editing.id), {
          title_en: form.title_en, title_np: form.title_np,
        });
        toast.success('Chapter updated', { description: form.title_en });
      } else {
        const nextOrder = sorted.length > 0 ? Math.max(...sorted.map(c => c.order)) + 1 : 1;
        const slug = uniqueSlug(form.title_en, sorted.map(c => c.slug));
        await addDoc(collection(db, 'chapters'), {
          subjectId: subject.id,
          title_en: form.title_en, title_np: form.title_np,
          slug, order: nextOrder, createdAt: new Date(),
        });
        toast.success('Chapter added', { description: `Ch ${nextOrder} · ${form.title_en}` });
      }
      setShowForm(false); setEditing(null); setForm(EMPTY);
    } catch (err) {
      toast.error('Save failed', { description: (err as Error).message });
    } finally { setLoading(false); }
  };

  const handleDelete = async (c: Chapter) => {
    const ok = await confirm({
      title: `Delete "${c.title_en}"?`,
      message: 'All notes and questions in this chapter will be permanently removed.',
      confirmLabel: 'Delete everything',
      tone: 'danger',
    });
    if (!ok) return;
    const loadingId = toast.loading('Deleting chapter and all children…');
    try {
      const result = await cascadeDeleteChapter(c.id);
      toast.success(`Chapter "${c.title_en}" deleted`, {
        id: loadingId,
        description: formatCascadeSummary(result),
      });
    } catch (err) {
      toast.error('Delete failed', { id: loadingId, description: (err as Error).message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold flex items-center gap-2">
            {subject.icon && <span>{subject.icon}</span>} {subject.name_en}
          </h1>
          <p className="text-sm text-[var(--text-3)] mt-1">{subject.name_np} · {termLabel(faculty?.termType, yearNum)} · {faculty?.name_en}</p>
        </div>
        <button onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium self-start">
          <Plus className="w-4 h-4" /> New Chapter
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card-surface rounded-2xl p-5 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">{editing ? 'Edit chapter' : 'Add chapter'}</h3>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }}
              className="p-1 text-[var(--text-3)] hover:text-[var(--text-1)]"><X className="w-4 h-4" /></button>
          </div>
          <Input label="Title (EN) *" value={form.title_en} onChange={v => setForm({ ...form, title_en: v })} required />
          <Input label="Title (नेपाली)" value={form.title_np} onChange={v => setForm({ ...form, title_np: v })} />
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

      {sorted.length === 0 ? (
        <div className="card-surface rounded-2xl p-10 text-center text-[var(--text-3)]">
          No chapters yet.
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((c, i) => (
            <motion.div key={c.id}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.25 }}
              className="card-surface rounded-xl p-4 flex items-center gap-3"
            >
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--accent-soft)] text-[var(--accent)] flex-shrink-0">Ch {c.order}</span>
              <Link to={`/admin/${facSlug}/year/${yearNum}/${subjSlug}/${c.slug}`} className="flex-1 min-w-0 group">
                <p className="font-semibold text-[var(--text-1)] truncate group-hover:text-[var(--accent)]">{c.title_en}</p>
                <p className="text-xs text-[var(--text-3)] truncate">{c.title_np} · /{c.slug}</p>
              </Link>
              <Link to={`/admin/${facSlug}/year/${yearNum}/${subjSlug}/${c.slug}`}
                className="p-1.5 rounded text-[var(--text-3)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)]">
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button onClick={() => openEdit(c)}
                className="p-1.5 rounded text-[var(--text-3)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)]">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(c)}
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
