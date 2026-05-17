import { Outlet, useParams, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useCollection } from '../hooks/useFirestore';
import AdminSidebar from '../components/AdminSidebar';
import { termLabel } from '../utils/term';
import type { Faculty, Subject, Chapter } from '../types';

export default function Admin() {
  const { facSlug, year, subjSlug, chSlug } = useParams();

  const { data: faculties } = useCollection<Faculty>('faculties');
  const { data: subjects } = useCollection<Subject>('subjects');
  const { data: chapters } = useCollection<Chapter>('chapters');

  const faculty = faculties.find(f => f.slug === facSlug);
  const yearNum = year ? parseInt(year) : undefined;
  const subject = subjects.find(s => s.slug === subjSlug && s.facultyId === faculty?.id && s.year === yearNum);
  const chapter = chapters.find(c => c.slug === chSlug && c.subjectId === subject?.id);

  const baseAdmin = '/admin';

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
      <AdminSidebar
        faculty={faculty}
        year={yearNum}
        subject={subject}
        chapter={chapter}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="border-b border-[var(--border)] bg-[var(--bg-1)] px-4 sm:px-6 py-3 sticky top-16 z-20">
          <div className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--text-3)]">
            <Link to={baseAdmin} className="inline-flex items-center gap-1 hover:text-[var(--accent)]">
              <Home className="w-3.5 h-3.5" /> Admin
            </Link>
            {faculty && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <Link to={`${baseAdmin}/${faculty.slug}`} className="hover:text-[var(--accent)] text-[var(--text-2)]">{faculty.name_en}</Link>
              </>
            )}
            {faculty && yearNum && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <Link to={`${baseAdmin}/${faculty.slug}/year/${yearNum}`} className="hover:text-[var(--accent)] text-[var(--text-2)]">{termLabel(faculty.termType, yearNum)}</Link>
              </>
            )}
            {subject && faculty && yearNum && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <Link to={`${baseAdmin}/${faculty.slug}/year/${yearNum}/${subject.slug}`} className="hover:text-[var(--accent)] text-[var(--text-2)]">{subject.name_en}</Link>
              </>
            )}
            {chapter && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-[var(--accent)] font-medium">{chapter.title_en}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
