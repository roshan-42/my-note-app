import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, BookOpen, GraduationCap, HelpCircle, Layers } from 'lucide-react';
import { useCollection } from '../../hooks/useFirestore';
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

  const stats = [
    { icon: GraduationCap, label: 'Faculties', value: faculties.length, color: 'text-[var(--accent)]' },
    { icon: BookOpen, label: 'Subjects', value: subjects.length },
    { icon: Layers, label: 'Chapters', value: chapters.length },
    { icon: BarChart3, label: 'Notes', value: notes.length },
    { icon: HelpCircle, label: 'Questions', value: questions.length },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="text-sm text-[var(--text-3)] mt-1">Manage faculties, years, subjects, chapters, notes & exam questions.</p>
      </div>

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
