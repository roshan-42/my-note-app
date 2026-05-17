import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookMarked } from 'lucide-react';
import { useCollection } from '../hooks/useFirestore';
import { useLanguage } from '../context/LanguageContext';
import type { Subject } from '../types';
import { where } from 'firebase/firestore';
import { useMemo } from 'react';

export default function Year() {
  const { year } = useParams<{ year: string }>();
  const yearNum = parseInt(year || '0');
  const { language } = useLanguage();

  const constraints = useMemo(
    () => (yearNum ? [where('yearId', '==', `year-${yearNum}`)] : []),
    [yearNum]
  );

  const { data: subjects, loading } = useCollection<Subject>('subjects', constraints);

  const yearDescriptions: Record<number, string> = {
    1: 'Foundation & Legal Theory',
    2: 'Core Law Subjects',
    3: 'Specialized & Practice',
  };

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
          <Link to="/" className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-white">Year {yearNum}</h1>
          <p className="text-gray-400 mt-1">{yearDescriptions[yearNum]}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold text-white mb-8">Subjects</h2>
        {subjects.length === 0 ? (
          <div className="text-center py-12">
            <BookMarked className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No subjects available for Year {yearNum}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map(subject => (
              <Link
                key={subject.id}
                to={`/year/${yearNum}/subject/${subject.slug}`}
                className="group relative overflow-hidden rounded-lg border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-6 hover:border-amber-600/50 transition-all hover:shadow-xl hover:shadow-amber-600/10 text-left h-full"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-amber-600/10 rounded-full blur-3xl group-hover:bg-amber-600/20 transition-colors" />
                <div className="relative">
                  {subject.icon && <div className="text-3xl mb-3">{subject.icon}</div>}
                  <h3 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors">
                    {language === 'en' ? subject.name_en : subject.name_np || subject.name_en}
                  </h3>
                  <p className="text-gray-400 text-sm mt-2">
                    {language === 'en' ? subject.name_np : subject.name_en}
                  </p>
                  <div className="inline-flex items-center gap-2 text-amber-400 mt-4 group-hover:gap-3 transition-all">
                    <span className="text-sm font-medium">View</span>
                    <span>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
