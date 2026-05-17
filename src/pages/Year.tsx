import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, BookMarked } from 'lucide-react';
import { where } from 'firebase/firestore';
import { useCollection } from '../hooks/useFirestore';
import { useLanguage } from '../context/LanguageContext';
import { termLabel } from '../utils/term';
import type { Faculty, Subject } from '../types';

export default function Year() {
  const { facSlug, year } = useParams<{ facSlug: string; year: string }>();
  const yearNum = parseInt(year || '0');
  const { language } = useLanguage();

  const { data: faculties } = useCollection<Faculty>('faculties');
  const faculty = faculties.find(f => f.slug === facSlug);

  const constraints = useMemo(
    () => (faculty ? [where('facultyId', '==', faculty.id), where('year', '==', yearNum)] : []),
    [faculty?.id, yearNum]
  );

  const { data: subjects, loading } = useCollection<Subject>('subjects', constraints);

  return (
    <div>
      <div className="border-b border-[var(--border)] bg-[var(--bg-1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <Link
            to={faculty ? `/faculty/${faculty.slug}` : '/faculties'}
            className="inline-flex items-center gap-1 text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] mb-3"
          >
            <ArrowLeft className="w-4 h-4" /> {faculty?.name_en || 'Faculties'}
          </Link>
          <div className="flex items-center gap-4">
            <div className="font-display text-5xl font-bold gradient-text">{yearNum}</div>
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-1">{termLabel(faculty?.termType, yearNum)}</p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold">Subjects</h1>
              {faculty && <p className="text-sm text-[var(--text-3)]">{faculty.name_en}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {loading ? (
          <div className="text-[var(--text-3)]">Loading…</div>
        ) : subjects.length === 0 ? (
          <div className="card-surface rounded-2xl p-12 text-center">
            <BookMarked className="w-12 h-12 text-[var(--text-3)] mx-auto mb-4" />
            <p className="text-[var(--text-2)] font-semibold">No subjects yet</p>
            <p className="text-sm text-[var(--text-3)] mt-1">Add subjects from the Admin panel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 grid-fade">
            {subjects.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.35 }}
              >
                <Link
                  to={`/faculty/${facSlug}/year/${yearNum}/${s.slug}`}
                  className="card-surface card-surface-hover rounded-2xl p-6 block relative overflow-hidden group h-full"
                >
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[var(--accent-soft)] blur-3xl group-hover:scale-125 transition-transform" />
                  <div className="relative">
                    {s.icon && <div className="text-3xl mb-3">{s.icon}</div>}
                    <h3 className="font-display text-lg font-bold text-[var(--text-1)] group-hover:text-[var(--accent)] transition-colors">
                      {language === 'en' ? s.name_en : s.name_np || s.name_en}
                    </h3>
                    <p className="text-sm text-[var(--text-3)] mt-1">
                      {language === 'en' ? s.name_np : s.name_en}
                    </p>
                    <div className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)]">
                      Open subject <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
