import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Menu, X } from 'lucide-react';
import { useCollection } from '../hooks/useFirestore';
import { useLanguage } from '../context/LanguageContext';
import DualLanguageToggle from '../components/DualLanguageToggle';
import ExamQuestionCard from '../components/ExamQuestionCard';
import type { Subject as SubjectType, Chapter, ExamQuestion } from '../types';
import { where } from 'firebase/firestore';

type FilterType = 'all' | 'past' | 'possible';

export default function SubjectExams() {
  const { year, slug } = useParams<{ year: string; slug: string }>();
  const { language, setLanguage } = useLanguage();

  const { data: subjects } = useCollection<SubjectType>('subjects');
  const subject = subjects.find(s => s.slug === slug);

  const chapterConstraints = useMemo(
    () => (subject ? [where('subjectId', '==', subject.id)] : []),
    [subject?.id]
  );

  const { data: chapters, loading: chaptersLoading } = useCollection<Chapter>('chapters', chapterConstraints);
  const { data: allQuestions, loading: questionsLoading } = useCollection<ExamQuestion>('questions');

  const chaptersWithQuestions = useMemo(() => {
    return [...chapters]
      .sort((a, b) => a.order - b.order)
      .map(ch => ({
        ...ch,
        questions: allQuestions.filter(q => q.chapterId === ch.id),
      }));
  }, [chapters, allQuestions]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (chaptersWithQuestions.length > 0 && !selectedId) {
      setSelectedId(chaptersWithQuestions[0].id);
      setExpanded(new Set([chaptersWithQuestions[0].id]));
    }
  }, [chaptersWithQuestions, selectedId]);

  const selected = chaptersWithQuestions.find(c => c.id === selectedId);
  const filteredQuestions = selected
    ? selected.questions.filter(q => filterType === 'all' ? true : q.type === filterType)
    : [];

  const toggle = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  };

  if (chaptersLoading || questionsLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-400">Loading...</div></div>;
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col lg:flex-row">
      {!sidebarOpen && (
        <button onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-20 left-4 z-50 p-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white shadow-lg">
          <Menu className="w-5 h-5" />
        </button>
      )}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:sticky lg:top-14 w-80 border-r border-slate-700 bg-slate-900 h-[calc(100vh-3.5rem)] overflow-y-auto z-40 transition-transform lg:transition-none ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between gap-4 mb-4">
            <Link to={`/year/${year}/subject/${slug}`} className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 transition-colors">
              <ArrowLeft className="w-4 h-4" />Back
            </Link>
            <button onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded hover:bg-slate-800 transition-colors text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <h2 className="text-lg font-semibold text-white">Chapters</h2>
        </div>

        <div className="p-6 space-y-2">
          {chaptersWithQuestions.map(ch => (
            <div key={ch.id}>
              <button
                onClick={() => {
                  setSelectedId(ch.id);
                  setExpanded(new Set([...expanded, ch.id]));
                  setSidebarOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors border ${
                  selectedId === ch.id
                    ? 'bg-purple-600/20 border-purple-600/50 text-purple-400 font-semibold'
                    : 'border-slate-700 text-gray-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    <span className="font-medium">Ch {ch.order}:</span>{' '}
                    {language === 'en' ? ch.title_en : ch.title_np || ch.title_en}
                  </span>
                  <span onClick={(e) => { e.stopPropagation(); toggle(ch.id); }}>
                    {expanded.has(ch.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </div>
              </button>

              {expanded.has(ch.id) && (
                <div className="ml-4 mt-2">
                  <div className="text-xs px-3 py-2 text-gray-500">
                    {ch.questions.filter(q => q.type === 'past').length} past • {' '}
                    {ch.questions.filter(q => q.type === 'possible').length} possible
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 w-full lg:w-auto">
        {selected && (
          <>
            <div className="sticky top-14 z-20 border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm px-4 lg:px-8 py-4 flex justify-between items-center gap-4">
              <h1 className="text-lg lg:text-xl font-semibold text-white truncate pl-12 lg:pl-0">
                {language === 'en' ? selected.title_en : selected.title_np || selected.title_en}
              </h1>
              <DualLanguageToggle currentLanguage={language} onLanguageChange={setLanguage} />
            </div>

            <div className="sticky top-[120px] z-10 border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm px-4 lg:px-8 py-3 flex gap-2 overflow-x-auto">
              {(['all', 'past', 'possible'] as FilterType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm whitespace-nowrap ${
                    filterType === t ? 'bg-purple-600 text-white' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  {t === 'all' ? 'All' : t === 'past' ? 'Past' : 'Possible'}
                </button>
              ))}
            </div>

            <div className="p-4 lg:p-8">
              {filteredQuestions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">
                    No {filterType === 'all' ? '' : filterType} questions in this chapter
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredQuestions.map(q => (
                    <ExamQuestionCard
                      key={q.id}
                      question_en={q.question_en}
                      question_np={q.question_np}
                      answer_en={q.answer_en}
                      answer_np={q.answer_np}
                      type={q.type}
                      language={language}
                    />
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
