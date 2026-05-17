import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, GraduationCap } from 'lucide-react';
import { useCollection } from '../hooks/useFirestore';
import type { Faculty } from '../types';

export default function Faculties() {
  const { data: faculties, loading } = useCollection<Faculty>('faculties');
  const sorted = [...faculties].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">Faculties</p>
        <h1 className="font-display text-3xl sm:text-5xl font-bold">All faculties</h1>
        <p className="text-[var(--text-3)] mt-2 max-w-2xl">Pick a faculty to drill into years, subjects, and chapters.</p>
      </div>

      {loading ? (
        <SkeletonGrid />
      ) : sorted.length === 0 ? (
        <div className="card-surface rounded-2xl p-12 text-center">
          <GraduationCap className="w-12 h-12 text-[var(--text-3)] mx-auto mb-4" />
          <p className="text-[var(--text-2)] font-semibold">No faculties yet</p>
          <p className="text-sm text-[var(--text-3)] mt-1">Add one from the Admin panel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 grid-fade">
          {sorted.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <Link
                to={`/faculty/${f.slug}`}
                className="card-surface card-surface-hover rounded-2xl p-6 block relative overflow-hidden group h-full"
              >
                <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-[var(--accent-soft)] blur-3xl group-hover:scale-125 transition-transform" />
                <div className="relative">
                  <div className="text-4xl mb-4">{f.icon || '🎓'}</div>
                  <h3 className="font-display text-xl font-bold text-[var(--text-1)] group-hover:text-[var(--accent)] transition-colors">{f.name_en}</h3>
                  <p className="text-sm text-[var(--text-3)] mt-1">{f.name_np}</p>
                  <p className="text-sm text-[var(--text-2)] mt-3 line-clamp-3">{f.description_en}</p>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-xs text-[var(--text-3)]">{f.totalYears} year{f.totalYears !== 1 ? 's' : ''}</span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)]">
                      Open <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card-surface rounded-2xl p-6 animate-pulse">
          <div className="w-10 h-10 rounded-lg bg-[var(--surface-3)] mb-4" />
          <div className="h-5 w-2/3 bg-[var(--surface-3)] rounded mb-2" />
          <div className="h-3 w-1/3 bg-[var(--surface-3)] rounded mb-4" />
          <div className="h-3 w-full bg-[var(--surface-3)] rounded mb-2" />
          <div className="h-3 w-5/6 bg-[var(--surface-3)] rounded" />
        </div>
      ))}
    </div>
  );
}
