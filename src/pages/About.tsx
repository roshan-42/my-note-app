import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Globe, Heart, Users } from 'lucide-react';

export default function About() {
  return (
    <div>
      <section className="bg-aurora">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
          <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-3">About</p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="font-display text-4xl sm:text-6xl font-bold"
          >
            Built for Nepal's students.
          </motion.h1>
          <p className="text-[var(--text-2)] mt-6 max-w-2xl mx-auto leading-relaxed">
            NotesNepal is a free, bilingual knowledge base for university curricula in Nepal — starting with LLB,
            and expanding across faculties. Designed for clarity, speed, and the way students actually study.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[
          { icon: BookOpen, t: 'Comprehensive', d: 'Every chapter, every key topic — written for understanding, not just memorization.' },
          { icon: Globe, t: 'Bilingual', d: 'Read in English or नेपाली, switch instantly. Legal terminology stays accurate either way.' },
          { icon: Users, t: 'Student-first', d: 'No paywalls, no ads. The notes you wish your seniors had passed down.' },
          { icon: Heart, t: 'Maintained', d: 'Updated against current syllabi as faculties revise their curriculum.' },
        ].map(({ icon: Icon, t, d }, i) => (
          <motion.div key={t}
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.05, duration: 0.4 }}
            className="card-surface rounded-2xl p-6"
          >
            <div className="w-11 h-11 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)] mb-3">
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold mb-1">{t}</h3>
            <p className="text-sm text-[var(--text-3)]">{d}</p>
          </motion.div>
        ))}
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-20 text-center">
        <Link
          to="/faculties"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--grad-1)] to-[var(--grad-2)] text-white font-semibold shadow-lg hover:-translate-y-0.5 transition-transform"
        >
          Browse faculties <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
