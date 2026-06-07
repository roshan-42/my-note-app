import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { where } from "firebase/firestore";
import { useCollection } from "../hooks/useFirestore";
import { useLanguage } from "../context/LanguageContext";
import DualLanguageToggle from "../components/DualLanguageToggle";
import NotesExamsToggle from "../components/NotesExamsToggle";
import NoteBlockRenderer from "../components/NoteBlockRenderer";
import type { Faculty, Subject as SubjectType, Chapter, Note } from "../types";

export default function SubjectNotes() {
  const { facSlug, year, subjSlug, chSlug } = useParams<{
    facSlug: string;
    year: string;
    subjSlug: string;
    chSlug?: string;
  }>();
  const yearNum = parseInt(year || "0");
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const { data: faculties } = useCollection<Faculty>("faculties");
  const faculty = faculties.find((f) => f.slug === facSlug);

  const { data: subjects } = useCollection<SubjectType>("subjects");
  const subject = subjects.find(
    (s) =>
      s.slug === subjSlug && s.facultyId === faculty?.id && s.year === yearNum,
  );

  const chapterConstraints = useMemo(
    () => (subject ? [where("subjectId", "==", subject.id)] : []),
    [subject?.id],
  );

  const { data: chapters, loading: chaptersLoading } = useCollection<Chapter>(
    "chapters",
    chapterConstraints,
  );
  const { data: allNotes, loading: notesLoading } =
    useCollection<Note>("notes");

  const chaptersWithNotes = useMemo(
    () =>
      [...chapters]
        .sort((a, b) => a.order - b.order)
        .map((ch) => ({
          ...ch,
          notes: allNotes
            .filter((n) => n.chapterId === ch.id)
            .sort((a, b) => a.order - b.order),
        })),
    [chapters, allNotes],
  );

  const selected = chSlug
    ? chaptersWithNotes.find((c) => c.slug === chSlug)
    : chaptersWithNotes[0];

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (selected) setExpanded(new Set([selected.id]));
  }, [selected?.id]);

  // Sync URL when default first chapter selected
  useEffect(() => {
    if (!chSlug && chaptersWithNotes.length > 0) {
      navigate(
        `/faculty/${facSlug}/year/${yearNum}/${subjSlug}/notes/${chaptersWithNotes[0].slug}`,
        { replace: true },
      );
    }
  }, [chSlug, chaptersWithNotes.length]);

  const toggle = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  };

  if (chaptersLoading || notesLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-[var(--text-3)]">
        Loading…
      </div>
    );
  }

  const base = `/faculty/${facSlug}/year/${yearNum}/${subjSlug}`;

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-20 left-3 z-40 p-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-lg"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed lg:sticky lg:top-16 top-0 left-0 w-80 border-r border-[var(--border)] bg-[var(--bg-1)] h-screen lg:h-[calc(100vh-4rem)] overflow-y-auto z-40 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-5 border-b border-[var(--border)] sticky top-0 bg-[var(--bg-1)] z-10">
          <div className="flex items-center justify-between gap-4 mb-3">
            <Link
              to={base}
              className="inline-flex items-center gap-1 text-sm text-[var(--accent)] hover:text-[var(--accent-hover)]"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded hover:bg-[var(--surface-1)] text-[var(--text-3)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <h2 className="font-display text-lg font-bold">Chapters</h2>
          <p className="text-xs text-[var(--text-3)] mt-0.5">
            {chaptersWithNotes.length} total
          </p>
        </div>

        <div className="p-3 space-y-1">
          {chaptersWithNotes.map((ch) => (
            <div key={ch.id}>
              <button
                onClick={() => {
                  navigate(`${base}/notes/${ch.slug}`);
                  setSidebarOpen(false);
                  setExpanded(new Set([...expanded, ch.id]));
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-start gap-2 ${
                  selected?.id === ch.id
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "text-[var(--text-2)] hover:bg-[var(--surface-1)]"
                }`}
              >
                <span className="text-xs font-mono mt-0.5 opacity-70">
                  {ch.order}.
                </span>
                <span className="flex-1 text-sm leading-snug">
                  {language === "en" ? ch.title_en : ch.title_np || ch.title_en}
                </span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(ch.id);
                  }}
                  className="p-0.5 opacity-70 hover:opacity-100 flex-shrink-0"
                >
                  {expanded.has(ch.id) ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </span>
              </button>

              {expanded.has(ch.id) && (
                <div className="ml-7 mt-1 space-y-0.5 pb-2">
                  {ch.notes.length === 0 ? (
                    <div className="text-xs px-3 py-1 text-[var(--text-3)] italic">
                      No notes
                    </div>
                  ) : (
                    ch.notes.map((n) => (
                      <div
                        key={n.id}
                        className="text-xs px-3 py-1.5 rounded text-[var(--text-3)] truncate"
                      >
                        ·{" "}
                        {language === "en"
                          ? n.title_en
                          : n.title_np || n.title_en}
                      </div>
                    ))
                  )}
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
                {language === "en"
                  ? selected.title_en
                  : selected.title_np || selected.title_en}
              </h1>
              <div className="flex items-center gap-2 sm:gap-3">
                <NotesExamsToggle base={base} chSlug={selected.slug} active="notes" />
                <DualLanguageToggle
                  currentLanguage={language}
                  onLanguageChange={setLanguage}
                />
              </div>
            </div>

            <div className="p-4 sm:p-8 space-y-6 max-w-4xl">
              {selected.notes.length === 0 ? (
                <div className="card-surface rounded-2xl p-12 text-center text-[var(--text-3)]">
                  No notes in this chapter yet.
                </div>
              ) : (
                selected.notes.map((note, i) => (
                  <motion.article
                    key={note.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.35 }}
                    className="card-surface rounded-2xl p-5 sm:p-8"
                  >
                    <h2 className="font-display text-xl sm:text-2xl font-bold mb-4">
                      {language === "en"
                        ? note.title_en
                        : note.title_np || note.title_en}
                    </h2>
                    <div className={language === "np" ? "text-lg" : ""}>
                      <NoteBlockRenderer
                        content={
                          language === "en"
                            ? note.content_en
                            : note.content_np || note.content_en
                        }
                        language={language}
                      />
                    </div>
                  </motion.article>
                ))
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
