import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, FileText } from 'lucide-react';
import { useCollection } from '../hooks/useFirestore';
import { useLanguage } from '../context/LanguageContext';
import type { Chapter, Subject as SubjectType } from '../types';
import { where } from 'firebase/firestore';
import { useMemo } from 'react';

export default function Subject() {
  const { year, slug } = useParams<{ year: string; slug: string }>();
  const yearNum = parseInt(year || '0');
  const { language } = useLanguage();

  const { data: subjects } = useCollection<SubjectType>('subjects');
  const subject = subjects.find(s => s.slug === slug);

  const constraints = useMemo(
    () => (subject ? [where('subjectId', '==', subject.id)] : []),
    [subject?.id]
  );

  const { data: chapters, loading } = useCollection<Chapter>('chapters', constraints);
  const chaptersSorted = [...chapters].sort((a, b) => a.order - b.order);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-14 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link to={`/year/${yearNum}`} className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />Back to Year {yearNum}
          </Link>
          <h1 className="text-3xl font-bold text-white">
            {language === 'en' ? subject?.name_en : subject?.name_np || subject?.name_en}
          </h1>
          <p className="text-gray-400 mt-1">
            {language === 'en' ? subject?.name_np : subject?.name_en}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold text-white mb-8">Study Materials</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link
            to={`/year/${yearNum}/subject/${slug}/notes`}
            className="group relative overflow-hidden rounded-lg border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-8 hover:border-blue-600/50 transition-all hover:shadow-xl hover:shadow-blue-600/10"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-colors" />
            <div className="relative">
              <BookOpen className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-2">Study Notes</h3>
              <p className="text-gray-400 mb-6">
                Comprehensive chapter-wise notes with detailed explanations and legal terminology.
              </p>
              <div className="text-sm text-blue-400 font-medium">
                {chapters.length} chapter{chapters.length !== 1 ? 's' : ''}
              </div>
              <div className="inline-flex items-center gap-2 text-blue-400 mt-6 group-hover:gap-3 transition-all">
                <span className="font-medium">Start Reading</span><span>→</span>
              </div>
            </div>
          </Link>

          <Link
            to={`/year/${yearNum}/subject/${slug}/exams`}
            className="group relative overflow-hidden rounded-lg border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-8 hover:border-purple-600/50 transition-all hover:shadow-xl hover:shadow-purple-600/10"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl group-hover:bg-purple-600/20 transition-colors" />
            <div className="relative">
              <FileText className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-2">Exam Questions</h3>
              <p className="text-gray-400 mb-6">
                Past papers and possible questions organized by chapter with detailed answers.
              </p>
              <div className="text-sm text-purple-400 font-medium">
                {chapters.length} chapter{chapters.length !== 1 ? 's' : ''}
              </div>
              <div className="inline-flex items-center gap-2 text-purple-400 mt-6 group-hover:gap-3 transition-all">
                <span className="font-medium">Practice Now</span><span>→</span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {chaptersSorted.length > 0 && (
        <div className="border-t border-slate-700 bg-slate-900/30 py-12">
          <div className="max-w-7xl mx-auto px-6">
            <h3 className="text-xl font-semibold text-white mb-6">Chapters</h3>
            <div className="space-y-2">
              {chaptersSorted.map(chapter => (
                <div
                  key={chapter.id}
                  className="px-4 py-3 rounded-lg border border-slate-700 bg-slate-800/50 text-gray-300 flex justify-between items-center"
                >
                  <span>
                    <span className="font-semibold text-slate-400">Chapter {chapter.order}:</span>{' '}
                    {language === 'en' ? chapter.title_en : chapter.title_np || chapter.title_en}
                  </span>
                  <span className="text-xs text-gray-500">
                    {language === 'en' ? chapter.title_np : chapter.title_en}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
