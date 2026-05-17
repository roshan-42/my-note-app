import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { BookOpen, HelpCircle, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCollection } from '../../hooks/useFirestore';
import NoteEditorModal from '../../components/NoteEditorModal';
import QuestionEditorModal from '../../components/QuestionEditorModal';
import type { Faculty, Subject, Chapter, Note, ExamQuestion } from '../../types';

type Tab = 'notes' | 'questions';
type Filter = 'all' | 'past' | 'possible';

export default function AdminChapter() {
  const { facSlug, year, subjSlug, chSlug } = useParams();
  const yearNum = parseInt(year || '0');

  const { data: faculties } = useCollection<Faculty>('faculties');
  const { data: subjects } = useCollection<Subject>('subjects');
  const { data: chapters } = useCollection<Chapter>('chapters');
  const { data: notes } = useCollection<Note>('notes');
  const { data: questions } = useCollection<ExamQuestion>('questions');

  const faculty = faculties.find(f => f.slug === facSlug);
  const subject = subjects.find(s => s.slug === subjSlug && s.facultyId === faculty?.id && s.year === yearNum);
  const chapter = chapters.find(c => c.slug === chSlug && c.subjectId === subject?.id);

  const [tab, setTab] = useState<Tab>('notes');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editingQ, setEditingQ] = useState<ExamQuestion | null>(null);
  const [showNote, setShowNote] = useState(false);
  const [showQ, setShowQ] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');

  if (!chapter) return <p className="text-[var(--text-3)]">Chapter not found.</p>;

  const chapterNotes = notes.filter(n => n.chapterId === chapter.id);
  const chapterQs = questions.filter(q => q.chapterId === chapter.id);
  const filtered = filter === 'all' ? chapterQs : chapterQs.filter(q => q.type === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">
          <span className="text-[var(--accent)] font-mono text-2xl mr-2">Ch {chapter.order}</span>
          {chapter.title_en}
        </h1>
        <p className="text-sm text-[var(--text-3)] mt-1">{chapter.title_np}</p>
      </div>

      <div className="flex border-b border-[var(--border)]">
        <TabBtn active={tab === 'notes'} onClick={() => setTab('notes')} icon={BookOpen} label={`Notes (${chapterNotes.length})`} />
        <TabBtn active={tab === 'questions'} onClick={() => setTab('questions')} icon={HelpCircle} label={`Questions (${chapterQs.length})`} />
      </div>

      {tab === 'notes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold">Notes</h2>
            <button onClick={() => { setEditingNote(null); setShowNote(true); }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium">
              <Plus className="w-4 h-4" /> New Note
            </button>
          </div>
          {chapterNotes.length === 0 ? (
            <div className="card-surface rounded-2xl p-8 text-center text-[var(--text-3)]">No notes yet.</div>
          ) : (
            <div className="space-y-2">
              {chapterNotes.map((n, i) => (
                <motion.button key={n.id}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => { setEditingNote(n); setShowNote(true); }}
                  className="card-surface card-surface-hover rounded-xl p-4 w-full text-left"
                >
                  <p className="font-semibold text-[var(--text-1)]">{n.title_en}</p>
                  <p className="text-xs text-[var(--text-3)] mt-1">{n.title_np}</p>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'questions' && (
        <div className="space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <div className="flex gap-1.5">
              {(['all', 'past', 'possible'] as Filter[]).map(t => (
                <button key={t} onClick={() => setFilter(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    filter === t ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface-1)] text-[var(--text-2)] hover:bg-[var(--surface-2)]'
                  }`}>
                  {t === 'all' ? 'All' : t === 'past' ? 'Past' : 'Possible'}
                </button>
              ))}
            </div>
            <button onClick={() => { setEditingQ(null); setShowQ(true); }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium">
              <Plus className="w-4 h-4" /> New Question
            </button>
          </div>
          {filtered.length === 0 ? (
            <div className="card-surface rounded-2xl p-8 text-center text-[var(--text-3)]">No questions.</div>
          ) : (
            <div className="space-y-2">
              {filtered.map((q, i) => (
                <motion.button key={q.id}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => { setEditingQ(q); setShowQ(true); }}
                  className="card-surface card-surface-hover rounded-xl p-4 w-full text-left"
                >
                  <div className="text-xs font-medium text-[var(--accent)] mb-1">
                    {q.type === 'past' ? 'Past Question' : 'Possible Question'}
                  </div>
                  <p className="font-semibold text-[var(--text-1)] text-sm">{q.question_en}</p>
                  {q.question_np && <p className="text-xs text-[var(--text-3)] mt-1">{q.question_np}</p>}
                </motion.button>
              ))}
            </div>
          )}
        </div>
      )}

      {showNote && (
        <NoteEditorModal chapter={chapter} note={editingNote || undefined}
          onClose={() => { setShowNote(false); setEditingNote(null); }} onSave={() => {}} />
      )}
      {showQ && (
        <QuestionEditorModal chapter={chapter} question={editingQ || undefined}
          onClose={() => { setShowQ(false); setEditingQ(null); }} onSave={() => {}} />
      )}
    </div>
  );
}

function TabBtn({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: React.ElementType; label: string }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
        active ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text-3)] hover:text-[var(--text-1)]'
      }`}>
      <Icon className="w-4 h-4" /> {label}
    </button>
  );
}
