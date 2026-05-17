import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, BookOpen, FileText, Layers } from 'lucide-react';
import { where } from 'firebase/firestore';
import { useCollection } from '../hooks/useFirestore';
import { useLanguage } from '../context/LanguageContext';
import type { Faculty, Chapter, Subject as SubjectType } from '../types';

export default function Subject() {
  const { facSlug, year, subjSlug } = useParams<{ facSlug: string; year: string; subjSlug: string }>();
  const yearNum = parseInt(year || '0');
  const { language } = useLanguage();

  const { data: faculties } = useCollection<Faculty>('faculties');
  const faculty = faculties.find(f => f.slug === facSlug);

  const { data: subjects } = useCollection<SubjectType>('subjects');
  const subject = subjects.find(s => s.slug === subjSlug && s.facultyId === faculty?.id && s.year === yearNum);

  const constraints = useMemo(
    () => (subject ? [where('subjectId', '==', subject.id)] : []),
    [subject?.id]
  );

  const { data: chapters, loading } = useCollection<Chapter>('chapters', constraints);
  const sortedChapters = [...chapters].sort((a, b) => a.order - b.order);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-[var(--text-3)]">Loading…</div>;
  if (!subject) return (
    <div className="max-w-2xl mx-auto px-6 py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Subject not found</h1>
      <Link to={`/faculty/${facSlug}/year/${yearNum}`} className="text-[var(--accent)] mt-4 inline-flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Back</Link>
    </div>
  );

  const base = `/faculty/${facSlug}/year/${yearNum}/${subjSlug}`;

  return (
    <div>
      <div className="border-b border-[var(--border)] bg-[var(--bg-1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <Link to={`/faculty/${facSlug}/year/${yearNum}`} className="inline-flex items-center gap-1 text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] mb-3">
            <ArrowLeft className="w-4 h-4" /> Year {yearNum}
          </Link>
          <div className="flex items-center gap-4">
            {subject.icon && <div className="text-4xl sm:text-5xl">{subject.icon}</div>}
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-1">Subject</p>
              <h1 className="font-display text-2xl sm:text-4xl font-bold">
                {language === 'en' ? subject.name_en : subject.name_np || subject.name_en}
              </h1>
              <p className="text-sm text-[var(--text-3)] mt-1">
                {language === 'en' ? subject.name_np : subject.name_en}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <ActionCard
            to={`${base}/notes`}
            icon={BookOpen}
            title="Study Notes"
            desc="Comprehensive bilingual notes chapter-by-chapter."
            count={chapters.length}
            countLabel="chapters"
            cta="Start Reading"
          />
          <ActionCard
            to={`${base}/exams`}
            icon={FileText}
            title="Exam Questions"
            desc="Past papers and possible questions with answers."
            count={chapters.length}
            countLabel="chapters"
            cta="Practice Now"
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-6">
            <Layers className="w-5 h-5 text-[var(--accent)]" />
            <h2 className="font-display text-2xl font-bold">Chapters</h2>
          </div>
          {sortedChapters.length === 0 ? (
            <div className="card-surface rounded-2xl p-8 text-center text-[var(--text-3)]">
              No chapters yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sortedChapters.map((ch, i) => (
                <motion.div
                  key={ch.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                >
                  <Link
                    to={`${base}/notes/${ch.slug}`}
                    className="card-surface card-surface-hover rounded-xl p-4 flex justify-between items-center group"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--accent-soft)] text-[var(--accent)]">Ch {ch.order}</span>
                        <span className="font-semibold text-[var(--text-1)] truncate group-hover:text-[var(--accent)] transition-colors">
                          {language === 'en' ? ch.title_en : ch.title_np || ch.title_en}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-3)] mt-1 truncate">
                        {language === 'en' ? ch.title_np : ch.title_en}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[var(--text-3)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionCard({ to, icon: Icon, title, desc, count, countLabel, cta }: {
  to: string; icon: React.ElementType; title: string; desc: string; count: number; countLabel: string; cta: string;
}) {
  return (
    <Link to={to} className="card-surface card-surface-hover rounded-2xl p-7 relative overflow-hidden group block h-full">
      <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-[var(--accent-soft)] blur-3xl group-hover:scale-125 transition-transform" />
      <div className="relative">
        <div className="w-12 h-12 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)] mb-4">
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="font-display text-2xl font-bold mb-1">{title}</h3>
        <p className="text-sm text-[var(--text-3)]">{desc}</p>
        <div className="mt-5 flex items-center justify-between">
          <span className="text-xs text-[var(--text-3)]">{count} {countLabel}</span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)]">
            {cta} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}
