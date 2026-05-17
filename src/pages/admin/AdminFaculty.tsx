import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen } from 'lucide-react';
import { useCollection } from '../../hooks/useFirestore';
import type { Faculty, Subject } from '../../types';

export default function AdminFaculty() {
  const { facSlug } = useParams();
  const { data: faculties } = useCollection<Faculty>('faculties');
  const { data: subjects } = useCollection<Subject>('subjects');
  const faculty = faculties.find(f => f.slug === facSlug);

  if (!faculty) return <p className="text-[var(--text-3)]">Faculty not found.</p>;

  const years = Array.from({ length: faculty.totalYears }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold flex items-center gap-3">
          <span>{faculty.icon || '🎓'}</span> {faculty.name_en}
        </h1>
        <p className="text-sm text-[var(--text-3)] mt-1">{faculty.description_en}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {years.map((y, i) => {
          const ySubs = subjects.filter(s => s.facultyId === faculty.id && s.year === y);
          return (
            <motion.div key={y}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
            >
              <Link to={`/admin/${faculty.slug}/year/${y}`}
                className="card-surface card-surface-hover rounded-2xl p-6 block relative overflow-hidden group h-full"
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[var(--accent-soft)] blur-3xl group-hover:scale-125 transition-transform" />
                <div className="relative">
                  <div className="font-display text-5xl font-bold gradient-text">{y}</div>
                  <h3 className="font-semibold mt-2">Year {y}</h3>
                  <p className="text-xs text-[var(--text-3)] mt-1 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> {ySubs.length} subject{ySubs.length !== 1 ? 's' : ''}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)]">
                    Manage <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
