import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, BookOpen, GraduationCap, HelpCircle, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { doc, writeBatch } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useCollection } from '../../hooks/useFirestore';
import { useConfirm } from '../../context/ConfirmContext';
import FacultyEditor from '../../components/FacultyEditor';
import { termLabelPlural } from '../../utils/term';
import type { Faculty, Subject, Chapter, Note, ExamQuestion } from '../../types';

export default function AdminHome() {
  const { data: faculties } = useCollection<Faculty>('faculties');
  const { data: subjects } = useCollection<Subject>('subjects');
  const { data: chapters } = useCollection<Chapter>('chapters');
  const { data: notes } = useCollection<Note>('notes');
  const { data: questions } = useCollection<ExamQuestion>('questions');

  const sorted = [...faculties].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const live = useMemo(() => {
    const facIds = new Set(faculties.map(f => f.id));
    const liveSubjects = subjects.filter(s => facIds.has(s.facultyId));
    const subjIds = new Set(liveSubjects.map(s => s.id));
    const liveChapters = chapters.filter(c => subjIds.has(c.subjectId));
    const chIds = new Set(liveChapters.map(c => c.id));
    const liveNotes = notes.filter(n => chIds.has(n.chapterId));
    const liveQuestions = questions.filter(q => chIds.has(q.chapterId));
    return {
      subjects: liveSubjects.length,
      chapters: liveChapters.length,
      notes: liveNotes.length,
      questions: liveQuestions.length,
      orphans:
        (subjects.length - liveSubjects.length) +
        (chapters.length - liveChapters.length) +
        (notes.length - liveNotes.length) +
        (questions.length - liveQuestions.length),
    };
  }, [faculties, subjects, chapters, notes, questions]);

  const stats = [
    { icon: GraduationCap, label: 'Faculties', value: faculties.length, color: 'text-[var(--accent)]' },
    { icon: BookOpen, label: 'Subjects', value: live.subjects },
    { icon: Layers, label: 'Chapters', value: live.chapters },
    { icon: BarChart3, label: 'Notes', value: live.notes },
    { icon: HelpCircle, label: 'Questions', value: live.questions },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="text-sm text-[var(--text-3)] mt-1">Manage faculties, years, subjects, chapters, notes & exam questions.</p>
      </div>

      {live.orphans > 0 && (
        <OrphanWarning
          orphans={live.orphans}
          totals={{
            subjects: subjects.length - live.subjects,
            chapters: chapters.length - live.chapters,
            notes: notes.length - live.notes,
            questions: questions.length - live.questions,
          }}
          subjects={subjects} chapters={chapters} notes={notes} questions={questions}
          faculties={faculties}
        />
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            className="card-surface rounded-2xl p-5"
          >
            <s.icon className={`w-6 h-6 mb-3 ${s.color || 'text-[var(--text-2)]'}`} />
            <div className="font-display text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-[var(--text-3)] uppercase tracking-wider mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <FacultyEditor faculties={sorted} />

      {sorted.length > 0 && (
        <div>
          <h2 className="font-display text-xl font-bold mb-4">Open a faculty</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map(f => (
              <Link key={f.id} to={`/admin/${f.slug}`}
                className="card-surface card-surface-hover rounded-2xl p-5 flex items-center gap-4 group"
              >
                <div className="text-3xl">{f.icon || '🎓'}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate group-hover:text-[var(--accent)]">{f.name_en}</p>
                  <p className="text-xs text-[var(--text-3)] truncate">{termLabelPlural(f.termType, f.totalYears)} · /{f.slug}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--text-3)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OrphanWarning({
  orphans, totals, subjects, chapters, notes, questions, faculties,
}: {
  orphans: number;
  totals: { subjects: number; chapters: number; notes: number; questions: number };
  subjects: Subject[]; chapters: Chapter[]; notes: Note[]; questions: ExamQuestion[];
  faculties: Faculty[];
}) {
  const confirm = useConfirm();
  const handleCleanup = async () => {
    const ok = await confirm({
      title: `Purge ${orphans} orphaned record${orphans !== 1 ? 's' : ''}?`,
      message: 'Removes subjects/chapters/notes/questions whose parent no longer exists. Cannot be undone.',
      confirmLabel: 'Purge orphans',
      tone: 'warning',
    });
    if (!ok) return;
    const loadingId = toast.loading('Purging orphans…');
    try {
      const facIds = new Set(faculties.map(f => f.id));
      const liveSubjIds = new Set(subjects.filter(s => facIds.has(s.facultyId)).map(s => s.id));
      const liveChIds = new Set(chapters.filter(c => liveSubjIds.has(c.subjectId)).map(c => c.id));

      const refs: { col: string; id: string }[] = [];
      subjects.forEach(s => { if (!facIds.has(s.facultyId)) refs.push({ col: 'subjects', id: s.id }); });
      chapters.forEach(c => { if (!liveSubjIds.has(c.subjectId)) refs.push({ col: 'chapters', id: c.id }); });
      notes.forEach(n => { if (!liveChIds.has(n.chapterId)) refs.push({ col: 'notes', id: n.id }); });
      questions.forEach(q => { if (!liveChIds.has(q.chapterId)) refs.push({ col: 'questions', id: q.id }); });

      for (let i = 0; i < refs.length; i += 450) {
        const slice = refs.slice(i, i + 450);
        const batch = writeBatch(db);
        slice.forEach(({ col, id }) => batch.delete(doc(db, col, id)));
        await batch.commit();
      }
      toast.success(`Purged ${refs.length} orphan${refs.length !== 1 ? 's' : ''}`, { id: loadingId });
    } catch (err) {
      toast.error('Purge failed', { id: loadingId, description: (err as Error).message });
    }
  };

  const parts: string[] = [];
  if (totals.subjects) parts.push(`${totals.subjects} subject${totals.subjects !== 1 ? 's' : ''}`);
  if (totals.chapters) parts.push(`${totals.chapters} chapter${totals.chapters !== 1 ? 's' : ''}`);
  if (totals.notes) parts.push(`${totals.notes} note${totals.notes !== 1 ? 's' : ''}`);
  if (totals.questions) parts.push(`${totals.questions} question${totals.questions !== 1 ? 's' : ''}`);

  return (
    <div className="card-surface rounded-2xl p-5 border border-amber-500/30 bg-amber-500/5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center flex-shrink-0">
          <Layers className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[var(--text-1)]">Orphaned records detected</h3>
          <p className="text-sm text-[var(--text-3)] mt-1">{parts.join(' · ')} have no live parent. Stats above exclude them.</p>
        </div>
        <button onClick={handleCleanup}
          className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold whitespace-nowrap">
          Purge orphans
        </button>
      </div>
    </div>
  );
}
