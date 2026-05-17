import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { useCollection } from '../hooks/useFirestore';
import type { Faculty as FacultyType, Subject } from '../types';

export default function Faculty() {
  const { facSlug } = useParams();
  const { data: faculties, loading } = useCollection<FacultyType>('faculties');
  const { data: subjects } = useCollection<Subject>('subjects');
  const faculty = faculties.find(f => f.slug === facSlug);

  if (loading) return <Loading />;
  if (!faculty) return <NotFoundBlock />;

  const years = Array.from({ length: faculty.totalYears }, (_, i) => i + 1);

  return (
    <div>
      <div className="border-b border-[var(--border)] bg-[var(--bg-1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <Link to="/faculties" className="inline-flex items-center gap-1 text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] mb-4">
            <ArrowLeft className="w-4 h-4" /> All faculties
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="text-5xl sm:text-6xl">{faculty.icon || '🎓'}</div>
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-1">Faculty</p>
              <h1 className="font-display text-3xl sm:text-5xl font-bold">{faculty.name_en}</h1>
              <p className="text-[var(--text-3)] mt-1">{faculty.name_np}</p>
              <p className="text-[var(--text-2)] mt-3 max-w-2xl">{faculty.description_en}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="font-display text-2xl sm:text-3xl font-bold mb-8">Pick your year</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {years.map((y, i) => {
            const yearSubjects = subjects.filter(s => s.facultyId === faculty.id && s.year === y);
            return (
              <motion.div
                key={y}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
              >
                <Link
                  to={`/faculty/${faculty.slug}/year/${y}`}
                  className="card-surface card-surface-hover rounded-2xl p-8 block relative overflow-hidden group h-full"
                >
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[var(--accent-soft)] blur-3xl group-hover:scale-125 transition-transform" />
                  <div className="relative">
                    <div className="font-display text-7xl font-bold gradient-text">{y}</div>
                    <h3 className="text-xl font-semibold mt-2">Year {y}</h3>
                    <div className="mt-4 flex items-center gap-2 text-sm text-[var(--text-3)]">
                      <BookOpen className="w-4 h-4" /> {yearSubjects.length} subject{yearSubjects.length !== 1 ? 's' : ''}
                    </div>
                    <div className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)]">
                      Open year <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Loading() {
  return <div className="min-h-[60vh] flex items-center justify-center text-[var(--text-3)]">Loading…</div>;
}

function NotFoundBlock() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-24 text-center">
      <h1 className="font-display text-3xl font-bold mb-2">Faculty not found</h1>
      <p className="text-[var(--text-3)]">Try one from the faculties page.</p>
      <Link to="/faculties" className="mt-6 inline-flex items-center gap-1 text-[var(--accent)] font-medium"><ArrowLeft className="w-4 h-4" /> Faculties</Link>
    </div>
  );
}
