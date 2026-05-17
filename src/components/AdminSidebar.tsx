import { useState } from 'react';
import { ChevronDown, ChevronRight, BookOpen } from 'lucide-react';
import { useCollection } from '../hooks/useFirestore';
import type { Subject, Chapter } from '../types';

interface Props {
  selectedYear: number | null;
  selectedSubject: Subject | null;
  selectedChapter: Chapter | null;
  onYearSelect: (year: number) => void;
  onSubjectSelect: (s: Subject | null) => void;
  onChapterSelect: (c: Chapter | null) => void;
}

export default function AdminSidebar({
  selectedYear, selectedSubject, selectedChapter,
  onYearSelect, onSubjectSelect, onChapterSelect,
}: Props) {
  const [expandedYear, setExpandedYear] = useState<number | null>(selectedYear);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(selectedSubject?.id || null);

  const { data: subjects } = useCollection<Subject>('subjects');
  const { data: chapters } = useCollection<Chapter>('chapters');

  const years = [1, 2, 3];

  return (
    <aside className="w-80 border-r border-slate-700 bg-slate-900 overflow-y-auto flex flex-col h-[calc(100vh-3.5rem)] sticky top-14">
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-lg font-bold text-white">LLB Admin</h2>
        <p className="text-xs text-gray-400 mt-1">Hierarchical Editor</p>
      </div>

      <div className="flex-1 p-4 space-y-1 overflow-y-auto">
        {years.map(year => {
          const yearSubjects = subjects.filter(s => s.yearId === `year-${year}`);
          return (
            <div key={year}>
              <button
                onClick={() => {
                  setExpandedYear(expandedYear === year ? null : year);
                  onYearSelect(year);
                  onSubjectSelect(null);
                  onChapterSelect(null);
                }}
                className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 transition-colors text-sm ${
                  selectedYear === year
                    ? 'bg-amber-600/20 text-amber-400 font-semibold'
                    : 'text-gray-300 hover:bg-slate-800'
                }`}
              >
                {expandedYear === year ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <BookOpen className="w-4 h-4" />
                Year {year}
              </button>

              {expandedYear === year && (
                <div className="ml-4 mt-1 space-y-0.5 border-l border-slate-700 pl-0">
                  {yearSubjects.map(subject => {
                    const subjChapters = chapters.filter(c => c.subjectId === subject.id).sort((a, b) => a.order - b.order);
                    return (
                      <div key={subject.id}>
                        <button
                          onClick={() => {
                            setExpandedSubject(expandedSubject === subject.id ? null : subject.id);
                            onSubjectSelect(subject);
                            onChapterSelect(null);
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-2 truncate ${
                            selectedSubject?.id === subject.id
                              ? 'bg-blue-600/20 text-blue-300 font-semibold'
                              : 'text-gray-400 hover:bg-slate-800'
                          }`}
                        >
                          {expandedSubject === subject.id ? <ChevronDown className="w-3 h-3 flex-shrink-0" /> : <ChevronRight className="w-3 h-3 flex-shrink-0" />}
                          <span className="truncate">{subject.name_en}</span>
                        </button>

                        {expandedSubject === subject.id && (
                          <div className="ml-4 mt-0.5 space-y-0.5 border-l border-slate-700 pl-0">
                            {subjChapters.map(ch => (
                              <button
                                key={ch.id}
                                onClick={() => onChapterSelect(ch)}
                                className={`w-full text-left px-3 py-1 rounded text-xs transition-colors truncate block ${
                                  selectedChapter?.id === ch.id
                                    ? 'bg-purple-600/20 text-purple-300 font-semibold'
                                    : 'text-gray-500 hover:bg-slate-800'
                                }`}
                              >
                                Ch {ch.order}: {ch.title_en}
                              </button>
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
    </aside>
  );
}
