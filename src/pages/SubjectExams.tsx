import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { where } from 'firebase/firestore';
import { useCollection } from '../hooks/useFirestore';
import { useLanguage } from '../context/LanguageContext';
import DualLanguageToggle from '../components/DualLanguageToggle';
import NotesExamsToggle from '../components/NotesExamsToggle';
import ExamQuestionCard from '../components/ExamQuestionCard';
import type { Faculty, Subject as SubjectType, Chapter, ExamQuestion } from '../types';

type FilterType = 'all' | 'past' | 'possible';

export default function SubjectExams() {
  const { facSlug, year, subjSlug, chSlug } = useParams<{ facSlug: string; year: string; subjSlug: string; chSlug?: string }>();
  const yearNum = parseInt(year || '0');
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const { data: faculties } = useCollection<Faculty>('faculties');
  const faculty = faculties.find(f => f.slug === facSlug);

  const { data: subjects } = useCollection<SubjectType>('subjects');
  const subject = subjects.find(s => s.slug === subjSlug && s.facultyId === faculty?.id && s.year === yearNum);

  const chapterConstraints = useMemo(
    () => (subject ? [where('subjectId', '==', subject.id)] : []),
    [subject?.id]
  );

  const { data: chapters, loading: chaptersLoading } = useCollection<Chapter>('chapters', chapterConstraints);
  const { data: allQuestions, loading: questionsLoading } = useCollection<ExamQuestion>('questions');

  const chaptersWithQ = useMemo(() => [...chapters]
    .sort((a, b) => a.order - b.order)
    .map(ch => ({
      ...ch,
      questions: allQuestions.filter(q => q.chapterId === ch.id),
    })), [chapters, allQuestions]);

  const selected = chSlug ? chaptersWithQ.find(c => c.slug === chSlug) : chaptersWithQ[0];

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (selected) setExpanded(new Set([selected.id]));
  }, [selected?.id]);

  useEffect(() => {
    if (!chSlug && chaptersWithQ.length > 0) {
      navigate(`/faculty/${facSlug}/year/${yearNum}/${subjSlug}/exams/${chaptersWithQ[0].slug}`, { replace: true });
    }
  }, [chSlug, chaptersWithQ.length]);

  const toggle = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  };

  const filteredQ = selected ? selected.questions.filter(q => filterType === 'all' ? true : q.type === filterType) : [];

  if (chaptersLoading || questionsLoading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-[var(--text-3)]">Loading…</div>;
  }

  const base = `/faculty/${facSlug}/year/${yearNum}/${subjSlug}`;

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
      {!sidebarOpen && (
        <button onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-20 left-3 z-40 p-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-lg">
          <Menu className="w-5 h-5" />
        </button>
      )}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
            onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      <aside className={`fixed lg:sticky lg:top-16 top-0 left-0 w-80 border-r border-[var(--border)] bg-[var(--bg-1)] h-screen lg:h-[calc(100vh-4rem)] overflow-y-auto z-40 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-5 border-b border-[var(--border)] sticky top-0 bg-[var(--bg-1)] z-10">
          <div className="flex items-center justify-between gap-4 mb-3">
            <Link to={base} className="inline-flex items-center gap-1 text-sm text-[var(--accent)] hover:text-[var(--accent-hover)]">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <button onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded hover:bg-[var(--surface-1)] text-[var(--text-3)]">
              <X className="w-5 h-5" />
            </button>
          </div>
          <h2 className="font-display text-lg font-bold">Chapters</h2>
          <p className="text-xs text-[var(--text-3)] mt-0.5">Exam questions</p>
        </div>

        <div className="p-3 space-y-1">
          {chaptersWithQ.map(ch => (
            <div key={ch.id}>
              <button
                onClick={() => {
                  navigate(`${base}/exams/${ch.slug}`);
                  setSidebarOpen(false);
                  setExpanded(new Set([...expanded, ch.id]));
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-start gap-2 ${
                  selected?.id === ch.id
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'text-[var(--text-2)] hover:bg-[var(--surface-1)]'
                }`}
              >
                <span className="text-xs font-mono mt-0.5 opacity-70">{ch.order}.</span>
                <span className="flex-1 text-sm leading-snug">
                  {language === 'en' ? ch.title_en : ch.title_np || ch.title_en}
                </span>
                <span onClick={(e) => { e.stopPropagation(); toggle(ch.id); }}
                  className="p-0.5 opacity-70 hover:opacity-100 flex-shrink-0">
                  {expanded.has(ch.id) ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </span>
              </button>

              {expanded.has(ch.id) && (
                <div className="ml-7 mt-1 mb-2 text-xs text-[var(--text-3)]">
                  {ch.questions.filter(q => q.type === 'past').length} past · {ch.questions.filter(q => q.type === 'possible').length} possible
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 w-full lg:w-auto min-w-0">
        {selected && (
          <>
            <div className="sticky top-16 z-20 border-b border-[var(--border)] bg-[var(--bg-1)]/90 backdrop-blur-lg px-4 sm:px-8 py-3 flex justify-between items-center gap-3">
              <h1 className="text-base sm:text-xl font-semibold truncate pl-10 lg:pl-0">
                <span className="text-[var(--accent)] font-mono mr-2">Ch {selected.order}</span>
                {language === 'en' ? selected.title_en : selected.title_np || selected.title_en}
              </h1>
              <div className="flex items-center gap-2 sm:gap-3">
                <NotesExamsToggle base={base} chSlug={selected.slug} active="exams" />
                <DualLanguageToggle currentLanguage={language} onLanguageChange={setLanguage} />
              </div>
            </div>

            <div className="sticky top-[112px] sm:top-[120px] z-10 border-b border-[var(--border)] bg-[var(--bg-1)]/90 backdrop-blur-lg px-4 sm:px-8 py-3 flex gap-2 overflow-x-auto">
              {(['all', 'past', 'possible'] as FilterType[]).map(t => (
                <button key={t} onClick={() => setFilterType(t)}
                  className={`px-4 py-1.5 rounded-full font-medium transition-colors text-sm whitespace-nowrap ${
                    filterType === t
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--surface-1)] text-[var(--text-2)] hover:bg-[var(--surface-2)]'
                  }`}>
                  {t === 'all' ? 'All' : t === 'past' ? 'Past' : 'Possible'}
                </button>
              ))}
            </div>

            <div className="p-4 sm:p-8 max-w-4xl">
              {filteredQ.length === 0 ? (
                <div className="card-surface rounded-2xl p-12 text-center text-[var(--text-3)]">
                  No {filterType === 'all' ? '' : filterType} questions.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredQ.map((q, i) => (
                    <motion.div key={q.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.3 }}>
                      <ExamQuestionCard
                        question_en={q.question_en} question_np={q.question_np}
                        answer_en={q.answer_en} answer_np={q.answer_np}
                        type={q.type} language={language}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
