import { Link } from 'react-router-dom';
import { BookOpen, FileQuestion } from 'lucide-react';

type Mode = 'notes' | 'exams';

export default function NotesExamsToggle({
  base,
  chSlug,
  active,
}: {
  base: string;
  chSlug?: string;
  active: Mode;
}) {
  const suffix = chSlug ? `/${chSlug}` : '';

  const itemClass = (mode: Mode) =>
    `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
      active === mode
        ? 'bg-[var(--accent)] text-white'
        : 'text-[var(--text-2)] hover:bg-[var(--surface-2)]'
    }`;

  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-full bg-[var(--surface-1)] border border-[var(--border)]">
      <Link to={`${base}/notes${suffix}`} className={itemClass('notes')}>
        <BookOpen className="w-3.5 h-3.5" /> Notes
      </Link>
      <Link to={`${base}/exams${suffix}`} className={itemClass('exams')}>
        <FileQuestion className="w-3.5 h-3.5" /> Exams
      </Link>
    </div>
  );
}
