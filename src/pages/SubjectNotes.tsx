import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Menu, X } from 'lucide-react';
import { useCollection } from '../hooks/useFirestore';
import { useLanguage } from '../context/LanguageContext';
import DualLanguageToggle from '../components/DualLanguageToggle';
import NoteBlockRenderer from '../components/NoteBlockRenderer';
import type { Subject as SubjectType, Chapter, Note } from '../types';
import { where } from 'firebase/firestore';

export default function SubjectNotes() {
  const { year, slug } = useParams<{ year: string; slug: string }>();
  const { language, setLanguage } = useLanguage();

  const { data: subjects } = useCollection<SubjectType>('subjects');
  const subject = subjects.find(s => s.slug === slug);

  const chapterConstraints = useMemo(
    () => (subject ? [where('subjectId', '==', subject.id)] : []),
    [subject?.id]
  );

  const { data: chapters, loading: chaptersLoading } = useCollection<Chapter>('chapters', chapterConstraints);
  const { data: allNotes, loading: notesLoading } = useCollection<Note>('notes');

  const chaptersWithNotes = useMemo(() => {
    return [...chapters]
      .sort((a, b) => a.order - b.order)
      .map(ch => ({
        ...ch,
        notes: allNotes.filter(n => n.chapterId === ch.id).sort((a, b) => a.order - b.order),
      }));
  }, [chapters, allNotes]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (chaptersWithNotes.length > 0 && !selectedId) {
      setSelectedId(chaptersWithNotes[0].id);
      setExpanded(new Set([chaptersWithNotes[0].id]));
    }
  }, [chaptersWithNotes, selectedId]);

  const selected = chaptersWithNotes.find(c => c.id === selectedId);

  const toggle = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  };

  if (chaptersLoading || notesLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-400">Loading...</div></div>;
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col lg:flex-row">
      {!sidebarOpen && (
        <button onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-20 left-4 z-50 p-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white shadow-lg">
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
          {chaptersWithNotes.map(ch => (
            <div key={ch.id}>
              <button
                onClick={() => {
                  setSelectedId(ch.id);
                  setExpanded(new Set([...expanded, ch.id]));
                  setSidebarOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors border ${
                  selectedId === ch.id
                    ? 'bg-amber-600/20 border-amber-600/50 text-amber-400 font-semibold'
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
                <div className="ml-4 mt-2 space-y-1">
                  {ch.notes.length === 0 ? (
                    <div className="text-xs px-3 py-2 text-gray-500 italic">No notes</div>
                  ) : (
                    ch.notes.map(n => (
                      <div key={n.id} className="text-xs px-3 py-2 rounded bg-slate-800/50 text-gray-400 border border-slate-700">
                        {language === 'en' ? n.title_en : n.title_np || n.title_en}
                      </div>
                    ))
                  )}
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

            <div className="p-4 lg:p-8 space-y-8">
              {selected.notes.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-400">No notes available in this chapter</p>
                </div>
              ) : (
                selected.notes.map(note => (
                  <article key={note.id} className="bg-slate-800 border border-slate-700 rounded-lg p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">
                      {language === 'en' ? note.title_en : note.title_np || note.title_en}
                    </h2>
                    <div className={language === 'np' ? 'text-lg' : ''}>
                      <NoteBlockRenderer
                        content={language === 'en' ? note.content_en : note.content_np || note.content_en}
                        language={language}
                      />
                    </div>
                  </article>
                ))
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
