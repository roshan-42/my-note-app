import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, BarChart3, Languages, ShieldCheck, Sparkles, GraduationCap } from 'lucide-react';
import { useCollection } from '../hooks/useFirestore';
import type { Faculty, Subject, Chapter, Note } from '../types';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

export default function Home() {
  const { data: faculties } = useCollection<Faculty>('faculties');
  const { data: subjects } = useCollection<Subject>('subjects');
  const { data: chapters } = useCollection<Chapter>('chapters');
  const { data: notes } = useCollection<Note>('notes');

  const sortedFaculties = [...faculties].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div>
      {/* Hero */}
      <section className="bg-aurora">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <motion.div
            initial="hidden"
            animate="show"
            variants={stagger}
            className="text-center max-w-3xl mx-auto relative z-10"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border-strong)] bg-[var(--surface-1)] text-xs font-medium text-[var(--text-2)] mb-6">
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
              Bilingual notes for Nepal's universities
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]"
            >
              Study smarter.{' '}
              <span className="gradient-text">Master every faculty.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-6 text-base sm:text-lg text-[var(--text-2)] max-w-2xl mx-auto leading-relaxed">
              Comprehensive chapter notes, past papers, and possible exam questions —
              organized by faculty, year and subject. English and नेपाली, side by side.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/faculties"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--grad-1)] to-[var(--grad-2)] text-white font-semibold shadow-lg shadow-[var(--accent-soft)] hover:-translate-y-0.5 hover:shadow-xl transition-all"
              >
                Browse Faculties <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-1)] text-[var(--text-1)] font-semibold hover:bg-[var(--surface-2)] transition-colors"
              >
                Learn more
              </Link>
            </motion.div>
          </motion.div>

          {/* Floating cards visual */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="hidden lg:block absolute top-12 -left-4 rotate-[-8deg] w-44"
            aria-hidden
          >
            <FloatCard tint="grad-1" label="Constitutional Law" sub="Chapter 4 · Fundamental Rights" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.8 }}
            className="hidden lg:block absolute top-20 -right-6 rotate-[6deg] w-44"
            aria-hidden
          >
            <FloatCard tint="grad-2" label="Macroeconomics" sub="Possible Q · 2024 batch" />
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-[var(--border)] bg-[var(--bg-1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
          <Stat label="Faculties" value={sortedFaculties.length} />
          <Stat label="Subjects" value={subjects.length} />
          <Stat label="Chapters" value={chapters.length} />
          <Stat label="Notes" value={notes.length} />
        </div>
      </section>

      {/* Faculty grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10"
        >
          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">Explore</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold">Choose your faculty</h2>
            <p className="text-[var(--text-3)] mt-2 max-w-2xl">Each faculty is mapped to its years, subjects and chapters.</p>
          </div>
          <Link to="/faculties" className="text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] inline-flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {sortedFaculties.length === 0 ? (
          <EmptyFaculties />
        ) : (
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 grid-fade"
          >
            {sortedFaculties.slice(0, 6).map(f => (
              <motion.div key={f.id} variants={fadeUp}>
                <FacultyCard f={f} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Features */}
      <section className="border-t border-[var(--border)] bg-[var(--bg-1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">Why students choose us</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold">Designed for serious study</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Feature icon={BookOpen} title="Comprehensive notes" desc="Chapter-by-chapter material with definitions, examples and case references." />
            <Feature icon={BarChart3} title="Past & possible questions" desc="Practice with curated past papers and predicted exam questions." />
            <Feature icon={Languages} title="Bilingual EN / नेपाली" desc="Toggle language instantly for terminology that matters." />
            <Feature icon={ShieldCheck} title="Verified content" desc="Notes reviewed and updated against current syllabi." />
            <Feature icon={GraduationCap} title="Multi-faculty" desc="LLB, BSc.CSIT, Economics and more — all under one roof." />
            <Feature icon={Sparkles} title="Lightweight & fast" desc="No clutter. Just clean, distraction-free study sessions." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-[var(--border-strong)] bg-gradient-to-br from-[var(--surface-1)] via-[var(--surface-2)] to-[var(--surface-1)] p-8 sm:p-16 text-center"
        >
          <div className="absolute inset-0 bg-aurora opacity-60 pointer-events-none" />
          <div className="relative">
            <h2 className="font-display text-3xl sm:text-5xl font-bold">Start your next study session</h2>
            <p className="text-[var(--text-2)] mt-3 max-w-xl mx-auto">Open the faculty you study in. Your chapters and exam questions are one tap away.</p>
            <Link
              to="/faculties"
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--grad-1)] to-[var(--grad-2)] text-white font-semibold shadow-lg hover:-translate-y-0.5 transition-transform"
            >
              Get started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="font-display text-3xl sm:text-4xl font-bold gradient-text">{value}</div>
      <div className="text-xs sm:text-sm text-[var(--text-3)] mt-1 uppercase tracking-wider">{label}</div>
    </div>
  );
}

function Feature({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="card-surface rounded-2xl p-6"
    >
      <div className="w-11 h-11 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)] mb-4">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-semibold text-[var(--text-1)] mb-1">{title}</h3>
      <p className="text-sm text-[var(--text-3)] leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function FacultyCard({ f }: { f: Faculty }) {
  return (
    <Link
      to={`/faculty/${f.slug}`}
      className="card-surface card-surface-hover rounded-2xl p-6 relative overflow-hidden block group h-full"
    >
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-[var(--accent-soft)] blur-3xl group-hover:scale-125 transition-transform" />
      <div className="relative">
        <div className="text-4xl mb-4">{f.icon || '🎓'}</div>
        <h3 className="font-display text-xl font-bold text-[var(--text-1)] group-hover:text-[var(--accent)] transition-colors">{f.name_en}</h3>
        <p className="text-sm text-[var(--text-3)] mt-1">{f.name_np}</p>
        <p className="text-sm text-[var(--text-2)] mt-3 line-clamp-2">{f.description_en}</p>
        <div className="mt-5 flex items-center justify-between">
          <span className="text-xs text-[var(--text-3)]">{f.totalYears} year{f.totalYears !== 1 ? 's' : ''}</span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)]">
            Explore <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function FloatCard({ tint, label, sub }: { tint: string; label: string; sub: string }) {
  return (
    <div className="card-surface rounded-2xl p-4 shadow-2xl shadow-black/40">
      <div className="w-10 h-10 rounded-lg mb-3" style={{ background: `var(--${tint})` }} />
      <p className="text-sm font-semibold text-[var(--text-1)]">{label}</p>
      <p className="text-xs text-[var(--text-3)] mt-0.5">{sub}</p>
    </div>
  );
}

function EmptyFaculties() {
  return (
    <div className="card-surface rounded-2xl p-12 text-center">
      <GraduationCap className="w-12 h-12 text-[var(--text-3)] mx-auto mb-4" />
      <p className="text-[var(--text-2)] font-semibold">No faculties yet</p>
      <p className="text-sm text-[var(--text-3)] mt-1">Head to the Admin panel and create your first faculty.</p>
      <Link to="/admin" className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors">
        Open Admin <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
