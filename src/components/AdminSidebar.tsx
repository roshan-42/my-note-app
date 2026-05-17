import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, GraduationCap, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCollection } from '../hooks/useFirestore';
import { termLabel } from '../utils/term';
import type { Faculty, Subject, Chapter } from '../types';

interface Props {
  faculty?: Faculty;
  year?: number;
  subject?: Subject;
  chapter?: Chapter;
}

export default function AdminSidebar({ faculty, year, subject, chapter }: Props) {
  const { data: faculties } = useCollection<Faculty>('faculties');
  const { data: subjects } = useCollection<Subject>('subjects');
  const { data: chapters } = useCollection<Chapter>('chapters');

  const [expandedFac, setExpandedFac] = useState<Set<string>>(new Set());
  const [expandedYear, setExpandedYear] = useState<Set<string>>(new Set());
  const [expandedSubj, setExpandedSubj] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (faculty) setExpandedFac(s => new Set([...s, faculty.id]));
    if (faculty && year) setExpandedYear(s => new Set([...s, `${faculty.id}-${year}`]));
    if (subject) setExpandedSubj(s => new Set([...s, subject.id]));
  }, [faculty?.id, year, subject?.id]);

  const toggle = (set: Set<string>, key: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setter(next);
  };

  const sorted = [...faculties].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)}
          className="lg:hidden fixed top-20 left-3 z-30 p-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-lg">
          <Menu className="w-5 h-5" />
        </button>
      )}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
            onClick={() => setOpen(false)} />
        )}
      </AnimatePresence>

      <aside className={`fixed lg:sticky lg:top-16 top-0 left-0 w-72 border-r border-[var(--border)] bg-[var(--bg-1)] h-screen lg:h-[calc(100vh-4rem)] overflow-y-auto z-40 transition-transform duration-300 ${
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-5 border-b border-[var(--border)] sticky top-0 bg-[var(--bg-1)] z-10 flex justify-between items-center">
          <div>
            <h2 className="font-display text-lg font-bold">Admin</h2>
            <p className="text-xs text-[var(--text-3)]">Faculty editor</p>
          </div>
          <button onClick={() => setOpen(false)}
            className="lg:hidden p-1.5 rounded hover:bg-[var(--surface-1)] text-[var(--text-3)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 space-y-0.5">
          {sorted.length === 0 ? (
            <p className="text-xs text-[var(--text-3)] px-3 py-2">No faculties yet. Add one from the dashboard.</p>
          ) : sorted.map(f => {
            const facOpen = expandedFac.has(f.id);
            const years = Array.from({ length: f.totalYears }, (_, i) => i + 1);
            return (
              <div key={f.id}>
                <div className="flex items-stretch">
                  <button onClick={() => toggle(expandedFac, f.id, setExpandedFac)}
                    className="p-1.5 text-[var(--text-3)] hover:text-[var(--accent)]">
                    {facOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                  <Link to={`/admin/${f.slug}`} onClick={() => setOpen(false)}
                    className={`flex-1 px-2 py-1.5 rounded text-sm flex items-center gap-2 transition-colors ${
                      faculty?.id === f.id && !year ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--text-2)] hover:bg-[var(--surface-1)]'
                    }`}>
                    <GraduationCap className="w-3.5 h-3.5" />
                    {f.name_en}
                  </Link>
                </div>

                {facOpen && (
                  <div className="ml-4 border-l border-[var(--border)] pl-1">
                    {years.map(y => {
                      const yk = `${f.id}-${y}`;
                      const yearOpen = expandedYear.has(yk);
                      const ySubs = subjects.filter(s => s.facultyId === f.id && s.year === y);
                      return (
                        <div key={y}>
                          <div className="flex items-stretch">
                            <button onClick={() => toggle(expandedYear, yk, setExpandedYear)}
                              className="p-1.5 text-[var(--text-3)] hover:text-[var(--accent)]">
                              {yearOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                            </button>
                            <Link to={`/admin/${f.slug}/year/${y}`} onClick={() => setOpen(false)}
                              className={`flex-1 px-2 py-1.5 rounded text-xs transition-colors ${
                                faculty?.id === f.id && year === y && !subject ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--text-2)] hover:bg-[var(--surface-1)]'
                              }`}>
                              {termLabel(f.termType, y, true)}
                            </Link>
                          </div>
                          {yearOpen && (
                            <div className="ml-4 border-l border-[var(--border)] pl-1">
                              {ySubs.length === 0 ? (
                                <div className="px-2 py-1 text-xs text-[var(--text-3)] italic">No subjects</div>
                              ) : ySubs.map(s => {
                                const sOpen = expandedSubj.has(s.id);
                                const sChaps = chapters.filter(c => c.subjectId === s.id).sort((a, b) => a.order - b.order);
                                return (
                                  <div key={s.id}>
                                    <div className="flex items-stretch">
                                      <button onClick={() => toggle(expandedSubj, s.id, setExpandedSubj)}
                                        className="p-1.5 text-[var(--text-3)] hover:text-[var(--accent)]">
                                        {sOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                      </button>
                                      <Link to={`/admin/${f.slug}/year/${y}/${s.slug}`} onClick={() => setOpen(false)}
                                        className={`flex-1 px-2 py-1 rounded text-xs truncate transition-colors ${
                                          subject?.id === s.id && !chapter ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--text-2)] hover:bg-[var(--surface-1)]'
                                        }`}>
                                        {s.name_en}
                                      </Link>
                                    </div>
                                    {sOpen && (
                                      <div className="ml-4 border-l border-[var(--border)] pl-1">
                                        {sChaps.length === 0 ? (
                                          <div className="px-2 py-1 text-xs text-[var(--text-3)] italic">No chapters</div>
                                        ) : sChaps.map(ch => (
                                          <Link key={ch.id} to={`/admin/${f.slug}/year/${y}/${s.slug}/${ch.slug}`} onClick={() => setOpen(false)}
                                            className={`block px-2 py-1 rounded text-xs truncate transition-colors ${
                                              chapter?.id === ch.id ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--text-3)] hover:bg-[var(--surface-1)] hover:text-[var(--text-2)]'
                                            }`}>
                                            <span className="opacity-60 font-mono mr-1">{ch.order}.</span>{ch.title_en}
                                          </Link>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
}
