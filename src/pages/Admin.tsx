import { useState } from 'react';
import { ArrowLeft, BarChart3, BookOpen, HelpCircle, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import SubjectEditor from '../components/SubjectEditor';
import ChapterEditor from '../components/ChapterEditor';
import NoteEditorModal from '../components/NoteEditorModal';
import QuestionEditorModal from '../components/QuestionEditorModal';
import { useCollection } from '../hooks/useFirestore';
import type { Subject, Chapter, Note, ExamQuestion } from '../types';

type FilterType = 'all' | 'past' | 'possible';

export default function Admin() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [contentType, setContentType] = useState<'notes' | 'questions'>('notes');

  const { data: subjects } = useCollection<Subject>('subjects');
  const { data: chapters } = useCollection<Chapter>('chapters');
  const { data: notes } = useCollection<Note>('notes');
  const { data: questions } = useCollection<ExamQuestion>('questions');

  const handleRefresh = () => setSelectedSubject(selectedSubject);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-slate-950 text-white">
      <AdminSidebar
        selectedYear={selectedYear}
        selectedSubject={selectedSubject}
        selectedChapter={selectedChapter}
        onYearSelect={setSelectedYear}
        onSubjectSelect={setSelectedSubject}
        onChapterSelect={setSelectedChapter}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-30">
          <div className="px-6 py-4">
            <Link to="/" className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 mb-3 transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" />Back to Home
            </Link>
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span className="text-base font-bold text-white">Admin Dashboard</span>
              {selectedYear && (
                <><span>→</span><span className="text-amber-400 font-semibold">Year {selectedYear}</span></>
              )}
              {selectedSubject && (
                <><span>→</span><span className="text-blue-400 font-semibold">{selectedSubject.name_en}</span></>
              )}
              {selectedChapter && (
                <><span>→</span><span className="text-purple-400 font-semibold">{selectedChapter.title_en}</span></>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!selectedYear ? (
            <DashboardOverview
              subjectsCount={subjects.length}
              chaptersCount={chapters.length}
              notesCount={notes.length}
              questionsCount={questions.length}
            />
          ) : !selectedSubject ? (
            <SubjectEditor year={selectedYear} subjects={subjects} onSubjectSelect={setSelectedSubject} onRefresh={handleRefresh} />
          ) : !selectedChapter ? (
            <ChapterEditor subject={selectedSubject} onRefresh={handleRefresh} />
          ) : (
            <ChapterContentView
              chapter={selectedChapter}
              contentType={contentType}
              onContentTypeChange={setContentType}
              notes={notes}
              questions={questions}
              onBack={() => setSelectedChapter(null)}
              onRefresh={handleRefresh}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardOverview({ subjectsCount, chaptersCount, notesCount, questionsCount }: {
  subjectsCount: number; chaptersCount: number; notesCount: number; questionsCount: number;
}) {
  const stats = [
    { icon: BookOpen, label: 'Subjects', value: subjectsCount, color: 'text-blue-400' },
    { icon: BarChart3, label: 'Chapters', value: chaptersCount, color: 'text-purple-400' },
    { icon: BookOpen, label: 'Notes', value: notesCount, color: 'text-green-400' },
    { icon: HelpCircle, label: 'Questions', value: questionsCount, color: 'text-amber-400' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold">Overview</h2>
        <p className="text-gray-400 text-sm mt-1">Select a year from sidebar to manage subjects, chapters, notes, and questions</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="p-6 rounded-lg border border-slate-700 bg-slate-800">
              <Icon className={`w-8 h-8 ${stat.color} mb-4`} />
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChapterContentView({
  chapter, contentType, onContentTypeChange, notes, questions, onBack, onRefresh,
}: {
  chapter: Chapter;
  contentType: 'notes' | 'questions';
  onContentTypeChange: (t: 'notes' | 'questions') => void;
  notes: Note[];
  questions: ExamQuestion[];
  onBack: () => void;
  onRefresh: () => void;
}) {
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<ExamQuestion | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>('all');

  const chapterNotes = notes.filter(n => n.chapterId === chapter.id);
  const chapterQuestions = questions.filter(q => q.chapterId === chapter.id);
  const filtered = filterType === 'all' ? chapterQuestions : chapterQuestions.filter(q => q.type === filterType);

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm">
        <ArrowLeft className="w-4 h-4" />Back to Chapters
      </button>

      <div>
        <h2 className="text-2xl font-semibold">Ch {chapter.order}: {chapter.title_en}</h2>
        <p className="text-gray-400 mt-1">{chapter.title_np}</p>
      </div>

      <div className="flex gap-4 border-b border-slate-700">
        <button onClick={() => onContentTypeChange('notes')}
          className={`px-6 py-3 font-semibold transition-colors flex items-center gap-2 ${
            contentType === 'notes' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400 hover:text-white'
          }`}>
          <BookOpen className="w-5 h-5" />Notes ({chapterNotes.length})
        </button>
        <button onClick={() => onContentTypeChange('questions')}
          className={`px-6 py-3 font-semibold transition-colors flex items-center gap-2 ${
            contentType === 'questions' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400 hover:text-white'
          }`}>
          <HelpCircle className="w-5 h-5" />Questions ({chapterQuestions.length})
        </button>
      </div>

      {contentType === 'notes' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Notes</h3>
            <button onClick={() => { setEditingNote(null); setShowNoteModal(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors">
              <Plus className="w-5 h-5" />New Note
            </button>
          </div>
          {chapterNotes.length === 0 ? (
            <p className="text-gray-400">No notes yet</p>
          ) : (
            <div className="space-y-3">
              {chapterNotes.map(note => (
                <button key={note.id} onClick={() => { setEditingNote(note); setShowNoteModal(true); }}
                  className="w-full text-left p-4 border border-slate-700 rounded-lg bg-slate-800 hover:border-amber-600 transition-colors">
                  <h4 className="font-semibold text-white">{note.title_en}</h4>
                  <p className="text-sm text-gray-400 mt-1">{note.title_np}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {contentType === 'questions' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Exam Questions</h3>
            <button onClick={() => { setEditingQuestion(null); setShowQuestionModal(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors">
              <Plus className="w-5 h-5" />New Question
            </button>
          </div>

          <div className="flex gap-2 mb-4">
            {(['all', 'past', 'possible'] as FilterType[]).map(t => (
              <button key={t} onClick={() => setFilterType(t)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  filterType === t ? 'bg-purple-600 text-white' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                }`}>
                {t === 'all' ? 'All' : t === 'past' ? 'Past' : 'Possible'}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="text-gray-400">No questions yet</p>
          ) : (
            <div className="space-y-3">
              {filtered.map(q => (
                <button key={q.id} onClick={() => { setEditingQuestion(q); setShowQuestionModal(true); }}
                  className="w-full text-left p-4 border border-slate-700 rounded-lg bg-slate-800 hover:border-purple-600 transition-colors">
                  <div className="text-xs font-medium text-purple-400 mb-1">
                    {q.type === 'past' ? 'Past Question' : 'Possible Question'}
                  </div>
                  <p className="font-semibold text-white text-sm">{q.question_en}</p>
                  {q.question_np && <p className="text-xs text-gray-400 mt-1">{q.question_np}</p>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {showNoteModal && (
        <NoteEditorModal
          chapter={chapter}
          note={editingNote || undefined}
          onClose={() => { setShowNoteModal(false); setEditingNote(null); }}
          onSave={onRefresh}
        />
      )}

      {showQuestionModal && (
        <QuestionEditorModal
          chapter={chapter}
          question={editingQuestion || undefined}
          onClose={() => { setShowQuestionModal(false); setEditingQuestion(null); }}
          onSave={onRefresh}
        />
      )}
    </div>
  );
}
